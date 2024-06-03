from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/cnn-business-news')
def cnn_business_news():
    try:
        url = 'https://edition.cnn.com/business'
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = soup.find_all('h3', class_='cd__headline')
            news_list = []
            for article in articles:
                title = article.text.strip()
                link = article.find('a')['href']
                news_list.append({'title': title, 'link': link})
            return jsonify({'status': 'success', 'data': news_list})
        else:
            return jsonify({'status': 'error', 'message': 'Failed to fetch news'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True)

