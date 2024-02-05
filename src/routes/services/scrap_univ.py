import sys
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def fetch_university_info(name, offset, limit):
    base_url = 'http://127.0.0.1:5000/search'
    # flask server
    params = {'name': name, 'offset': offset, 'limit': limit}

    try:
        response = requests.get(base_url, params=params)
        university_data = response.json()

        if university_data:
            # Extracting web page URL from the first result
            web_page_url = university_data[0]['web_pages'][0]

            # Fetch additional information using the web page URL
            additional_info = fetch_web_page_info(web_page_url)

            return additional_info

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")

def fetch_web_page_info(web_page_url):
    try:
        response = requests.get(web_page_url)
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract specific information using BeautifulSoup
        university_info = {
            'web_page_status_code': response.status_code,
            'university_name': soup.title.string.strip() if soup.title else None,
            'university_description': soup.find('meta', {'name': 'description'})['content'].strip() if soup.find('meta', {'name': 'description'}) else None,
            'favicon_url': find_favicon_url(web_page_url, soup),
            # Add more fields as needed
        }

        return university_info
    except requests.exceptions.RequestException as e:
        print(f"Error fetching web page info: {e}")
        return {'error': 'Failed to fetch web page info'}

def find_favicon_url(base_url, soup):
    # Attempt to find the favicon URL in different ways
    favicon_link = soup.find('link', {'rel': 'icon'})
    if favicon_link:
        return urljoin(base_url, favicon_link['href'])

    favicon_tag = soup.find('meta', {'property': 'og:image'})
    if favicon_tag:
        return urljoin(base_url, favicon_tag['content'])

    return None

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python script.py <name> <offset> <limit>")
        sys.exit(1)

    name = sys.argv[1]
    offset = int(sys.argv[2])
    limit = int(sys.argv[3])

    result = fetch_university_info(name, offset, limit)
    print(json.dumps(result))  # Ensure the result is printed as JSON
