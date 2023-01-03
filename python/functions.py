from keybert import KeyBERT 
from bs4 import BeautifulSoup
import torch


device = "cuda" if torch.cuda.is_available() else "cpu"


def summary_text(body,model_name,max_length):
    length_body = len(body.split(' '))

    max_length=round(int(max_length)*length_body/100)
    min_length = round(max_length / 2)

    body = body.replace(u'\xa0', u' ')
    if model_name == "facebook/bart-large-cnn":
        
        from transformers import BartTokenizer, BartForConditionalGeneration
        
        tokenizer = BartTokenizer.from_pretrained(model_name)
        model = BartForConditionalGeneration.from_pretrained(model_name).to(device)

        input_tokens = tokenizer(
            [body],
            return_tensors='pt',
            max_length=1024,
            truncation=True)['input_ids'].to(device)
        
        encoded_ids = model.generate(
            input_tokens,
            num_beams=4,
            length_penalty=2.0,
            min_length=min_length,
            max_length=max_length,
            no_repeat_ngram_size=3)

        summary = tokenizer.decode(encoded_ids.squeeze(), skip_special_tokens=True)
        split_points = summary.split('.')
        if (len(split_points)>1):
            del split_points[-1]
        
        if(split_points[0]==''):
            split_points=[]

        if len(split_points[0]) < 30:
           split_points=[] 

        summary = ""
        for point in split_points:
            summary +=point + '.'
    
    if model_name == "tuner007/pegasus_summarizer":
        from transformers import PegasusForConditionalGeneration, PegasusTokenizer
        
        tokenizer = PegasusTokenizer.from_pretrained(model_name)
        model = PegasusForConditionalGeneration.from_pretrained(model_name).to(device)

        input_tokens = tokenizer(
            body,
            return_tensors='pt',
            max_length=1024,
            truncation=True).to(device)

        encoded_ids = model.generate(**input_tokens,
            num_beams=4,
            length_penalty=2.0,
            min_length=min_length,
            max_length=max_length,
            no_repeat_ngram_size=3)
        summary = tokenizer.decode(encoded_ids[0].squeeze(), skip_special_tokens=True)
        split_points = summary.split('.')
        if (len(split_points)>1):
            del split_points[-1]

        if(split_points[0]==''):
            split_points=[]

        if len(split_points[0]) < 30:
           split_points=[] 
        summary = ""
        for point in split_points:
            summary +=point + '.'

    if model_name == "csebuetnlp/mT5_multilingual_XLSum":
        # from transformers import AutoTokenizer, AutoModelWithLMHead
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(device)

        input_tokens = tokenizer.encode(
            body,
            return_tensors='pt',
            max_length=1024,
            truncation=True).to(device)
        
        encoded_ids = model.generate(
            input_tokens,
            num_beams=4,
            length_penalty=2.0,
            min_length=min_length,
            max_length=max_length,
            no_repeat_ngram_size=3)

        summary = tokenizer.decode(encoded_ids[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)
        split_points = summary.split('.')
        if (len(split_points)>1):
            del split_points[-1]
        
        if(split_points[0]==''):
            split_points=[]

        if len(split_points[0]) < 30:
           split_points=[] 
        summary = ""
        for point in split_points:
            summary +=point + '.'

    kw_model = KeyBERT()
    keywords = kw_model.extract_keywords(body)
    response = {
        "summary":summary,
        "keywords":keywords
    }
    return response


def extract_from_xml(filename,tags):
    data = {}
    soup = BeautifulSoup(filename, 'lxml')
    for tag in soup.find_all('title'):
        content = ""
        if tag.text.strip() in tags:
            for p in tag.parent.find_all('p'):
                content += p.text
            data[tag.text.strip()] = content.strip()
    return data


