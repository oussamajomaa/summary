import os
from flask import Flask, request

from flask_cors import CORS
from werkzeug.utils import secure_filename
import json
import re
from bs4 import BeautifulSoup

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
    filename = secure_filename(file.filename)
    file.save(os.path.join('folder', filename))

    filepath = os.path.join('./folder', os.path.basename(filename))
    if extension == "xml":
        file = open (filepath,'r').read()
        data = {}
        data = extract_from_xml(file)

        # summary
        summaries = []
        for k, v in data.items():
            if len(v) > 0:
                obj= {
                    "title" : k,
                    "summary" : summary_text(v,model_name,max_length)
                }
                summaries.append(obj)
        # end summary
        
        soup = BeautifulSoup(file, 'xml')
        keyWord = soup.find("kwd-group", {"id": "kwd-group-1"})
        kw = []
        if keyWord:
            res = keyWord.find_all('kwd')
            for k in res:
                kw.append(k.text)

            print(res)
        
        response = {
            "data":summaries,
            "kw":kw
        }
        return response
    
    if extension == "txt":
        f = open(filepath, "r")

        contents = f.readlines()
        # convert array to string text
        contents = " ".join(contents)
        print(contents)
        response = summary_text(contents,model_name,max_length)
        print(response)
        return json.dumps(response)


if __name__ == '__main__':
    app.run(port=5000,debug=True)
    # app.run('0.0.0.0', debug=True, ssl_context=('cert.pem','key.pem'))