import urllib.request
import urllib.error
import json

def fetch_data(url):
    response = urllib.request.urlopen(url)
    data = response.read().decode('utf-8')
    return data

def fetch_json(url):
    data = fetch_data(url)
    return json.loads(data)

def download_file(url, save_path):
    response = urllib.request.urlopen(url)
    with open(save_path, 'wb') as f:
        f.write(response.read())

def build_url(base, params):
    query = urllib.parse.urlencode(params)
    return f"{base}?{query}"

# 注意：以下URL仅为示例，实际无法访问
try:
    result = json.loads('{"status": "ok", "data": [1, 2, 3]}')
    print(result)
except json.JSONDecodeError:
    print("JSON解析失败")

params = {"q": "python", "page": 1}
print(build_url("https://api.example.com/search", params))
