from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

NEWS_API_URL = "https://newsapi.org/v2/top-headlines"
API_KEY = "450840edf26f48c18296e241b8342db6"

def fetch_news(location, category=None):
    params = {
        'country': location,
        'apiKey': API_KEY,
    }

    if category:
        params['category'] = category

    response = requests.get(NEWS_API_URL, params=params)

    if response.status_code == 200:
        news_data = response.json()
        return jsonify(news_data)
    else:
        return jsonify({'error': 'Failed to fetch news'}), 500

@app.route('/news', methods=['GET'])
def get_news():
    country_code = request.args.get('location', 'us')
    return fetch_news(country_code)

@app.route('/news/category', methods=['GET'])
def get_news_by_category():
    country_code = request.args.get('location', 'us')
    category = request.args.get('category', 'general')
    return fetch_news(country_code, category)

if __name__ == '__main__':
    app.run(debug=True)
