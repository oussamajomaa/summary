from keybert import KeyBERT 
from bs4 import BeautifulSoup

def summary_text(body,model_name,max_length):
    length_body = len(body.split(' '))
    print("length_body "+str(length_body))
    max_length=round(int(max_length)*length_body/100)
    print("max_length "+str(max_length))
    if max_length < 50:
        min_length = 50
        max_length = 100
    min_length = round(max_length / 2)
    print("length body " + str(length_body))
    print("min_length "+str(min_length))
    print("max_length "+str(max_length))
    body = body.replace(u'\xa0', u' ')
    if model_name == "facebook/bart-large-cnn":
        
        from transformers import BartTokenizer, BartForConditionalGeneration
        tokenizer = BartTokenizer.from_pretrained(model_name)
        model = BartForConditionalGeneration.from_pretrained(model_name)

        input_tokens = tokenizer(
            [body],
            return_tensors='pt',
            max_length=1024,
            truncation=True)['input_ids']
        
        encoded_ids = model.generate(
            input_tokens,
            num_beams=4,
            length_penalty=2.0,
            min_length=min_length,
            max_length=max_length,
            no_repeat_ngram_size=3)

        summary = tokenizer.decode(encoded_ids.squeeze(), skip_special_tokens=True)
    
    if model_name == "tuner007/pegasus_summarizer":
        from transformers import PegasusForConditionalGeneration, PegasusTokenizer
        tokenizer = PegasusTokenizer.from_pretrained(model_name)
        model = PegasusForConditionalGeneration.from_pretrained(model_name)

        input_tokens = tokenizer(
            body,
            return_tensors='pt',
            max_length=1024,
            truncation=True)

        encoded_ids = model.generate(**input_tokens,
            num_beams=4,
            length_penalty=2.0,
            min_length=min_length,
            max_length=max_length,
            no_repeat_ngram_size=3)
        summary = tokenizer.decode(encoded_ids[0].squeeze(), skip_special_tokens=True)

    if model_name == "t5-large":
        from transformers import AutoTokenizer, AutoModelWithLMHead
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelWithLMHead.from_pretrained(model_name)

        input_tokens = tokenizer.encode(
            body,
            return_tensors='pt',
            max_length=1024,
            truncation=True)
        
        encoded_ids = model.generate(
            input_tokens,
            num_beams=int(2),
            length_penalty=2.0,
            min_length=min_length,
            max_length=max_length,
            no_repeat_ngram_size=3)

        summary = tokenizer.decode(encoded_ids[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)

    kw_model = KeyBERT()
    keywords = kw_model.extract_keywords(body)
    response = {
        "summary":summary,
        "keywords":keywords
    }
    return response


def extract_from_xml(filename):
    data = {}
    soup = BeautifulSoup(filename, 'lxml')
    abstract, intro, method, result, concl = ('' for i in range(5))
    for tag in soup.find_all('title'):
        if tag.text.strip() == 'Abstract':
            for p in tag.parent.find_all('p'):
                abstract += p.text
            data['Abstract'] = abstract.strip()
        elif 'Introduction' in tag.text.strip():
            for p in tag.parent.find_all('p'):
                intro += p.text
            data['Introduction'] = intro.strip()
        elif 'method' in tag.text.lower().strip() and method == '':
            for p in tag.parent.find_all('p'):
                method += p.text
            data['Methods'] = method.strip()
        elif 'result' in tag.text.lower().strip() and result == '':
            for p in tag.parent.find_all('p'):
                result += p.text
            data['Results'] = result.strip()
        elif ('conclusion' in tag.text.lower().strip() or 'discussion' in tag.text.lower().strip()) and concl == '':
            for p in tag.parent.find_all('p'):
                concl += p.text
            data['Conclusion'] = concl.strip()

    return data