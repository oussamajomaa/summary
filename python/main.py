import os
from flask import Flask, request
import urllib.request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import json
import re
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
 
from functions import summary_text, extract_from_xml


# Summarize text
@app.route('/', methods=['POST'])
def index():
    # body = json.loads(request.data)

    # Get body request
    body = request.get_json(force=True)

    # Get params request
    model_name = request.args.get('model')
    max_length = request.args.get('max_length')
    # body = body.replace(u'\xa0', u' ')
    response = summary_text(body,model_name,max_length)
    return json.dumps(response)

    

# Summarize xml or txt file
@app.route('/file', methods=['POST'])
def process():
    # baseUrl = os.path.dirname(os.path.abspath(__file__))
    model_name = request.args.get('model')
    file = request.files['file']
    extension = request.args.get('extension')
    max_length = request.args.get('max_length')
    tags = request.args.get('tags')
    print(tags)
    filename = secure_filename(file.filename)
    file.save(os.path.join('folder', filename))

    filepath = os.path.join('./folder', os.path.basename(filename))
    if extension == "xml":
        file = open (filepath,'r').read()
        data = {}
        data = extract_from_xml(file,tags)

        # summary
        summaries = []
        general_summary = ""
        for k, v in data.items():
            if len(v) > 0:
                sum = summary_text(v,model_name,max_length)
                obj= {
                    "title" : k,
                    "summary" : sum
                }
                summaries.append(obj)
        
        soup = BeautifulSoup(file, 'xml')
        for tag in soup.find_all('title'):
            if tag.text.strip() == 'Abstract':
                for p in tag.parent.find_all('p'):
                    general_summary += p.text
        keyWord = soup.find("kwd-group", {"id": "kwd-group-1"})
        kw = []
        if keyWord:
            res = keyWord.find_all('kwd')
            for k in res:
                kw.append(k.text)
        
        response = {
            "data":summaries,
            "kw":kw,
            "general_summary": general_summary
        }
        os.remove(filepath)
        return response
    
    if extension == "txt":
        f = open(filepath, "r")

        contents = f.readlines()
        # convert array to string text
        contents = " ".join(contents)
        print(contents)
        response = summary_text(contents,model_name,max_length)
        os.remove(filepath)
        return json.dumps(response)


@app.route('/translate', methods=['POST'])
def translator():
    target = request.args.get('target')
    # source = request.args.get('source')
    text = request.get_json(force=True)
    translated = GoogleTranslator(source="auto", target=target).translate(text)  
    return json.dumps(translated)


@app.route('/titles', methods=['POST'])
def get_titles():
    file = request.files['file']
    filename = secure_filename(file.filename)
    file.save(os.path.join('folder', filename))
    filepath = os.path.join('./folder', os.path.basename(filename))
    file = open (filepath,'r').read()
    soup = BeautifulSoup(file, 'lxml')

    titles =[]
    for tag in soup.find_all('title'):
        titles.append(tag.text)

    os.remove(filepath)
    
    return json.dumps(titles)


@app.route('/example_title')
def get_local_title():
    file = open ('./example/73-2022-03.xml','r').read()
    soup = BeautifulSoup(file, 'lxml')
    titles =[]
    for tag in soup.find_all('title'):
        titles.append(tag.text)
    
    print(titles)
    return json.dumps(titles)


@app.route('/example_summary')
def get_local_summary():
    model_name = request.args.get('model')
    max_length = request.args.get('max_length')
    tags = request.args.get('tags')
    file = open ('./example/73-2022-03.xml','r').read()
    data = {}
    data = extract_from_xml(file,tags)

    # summary
    summaries = []
    general_summary = ""
    for k, v in data.items():
        if len(v) > 0:
            sum = summary_text(v,model_name,max_length)
            obj= {
                "title" : k,
                "summary" : sum
            }
            summaries.append(obj)
    
    soup = BeautifulSoup(file, 'xml')
    for tag in soup.find_all('title'):
        if tag.text.strip() == 'Abstract':
            for p in tag.parent.find_all('p'):
                general_summary += p.text
    keyWord = soup.find("kwd-group", {"id": "kwd-group-1"})
    kw = []
    if keyWord:
        res = keyWord.find_all('kwd')
        for k in res:
            kw.append(k.text)
    
    response = {
        "data":summaries,
        "kw":kw,
        "general_summary": general_summary
    }
    return response

if __name__ == '__main__':
    app.run(port=5001,debug=True)
    # app.run('0.0.0.0', debug=True, ssl_context=('cert.pem','key.pem'))