import requests
import json
from datetime import datetime
from tasks.helper import Config, custom_put_object

now = datetime.now()

headers = {
    "accept": "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9",
    "authorization": "Bearer null",
    "connection": "keep-alive",
    "host": "famima.vn",
    "referer": "https://famima.vn/",
    "sec-ch-ua": '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0"
}


def get_categories(categories):
    categories_url = "https://famima.vn/api/category?isSpecial=false"

    categories_url_response = requests.get(categories_url, headers=headers)

    categories_data = json.loads(categories_url_response.text).get("data", [])
    for category_data in categories_data:
        categories.append({
            "id": category_data.get("_id"),
            "name": category_data.get("name")
            })


def crawl_product_familymart():
    data = []
    categories = []
    get_categories(categories)

    for category in categories:
        url = "https://famima.vn/api/products/search?categoryId=" + str(category["id"]) + "&limit=100"

        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            products_data = json.loads(response.text).get("data", [])
            # append category data to the main data dictionary
            # add new field "category" to each product
            for product in products_data:
                product["category"] = category["name"]
            data.extend(products_data)

        else:
            print(f"Error: {response.status_code} for category {category}")
            continue
    
    custom_put_object(Config.BRONZE_BUCKET_NAME, f"familymart/{now.year}/{now.month:02}/{now.day:02}/product.json", data)
