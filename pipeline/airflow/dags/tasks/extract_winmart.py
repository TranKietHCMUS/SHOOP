import requests
import json
from tasks.helper import Config, custom_put_object
from datetime import datetime

now = datetime.now()

categories = ['sua-cac-loai--c08', 'rau-cu-trai-cay--c02', 'thit-hai-san-tuoi--c03', 'hoa-pham-tay-rua--c10',
              'banh-keo--c07', 'do-uong-co-con--c31', 'do-uong-giai-khat--c09', 'mi-thuc-pham-an-lien--c34',
              'thuc-pham-kho--c06', 'thuc-pham-che-bien--c04', 'gia-vi--c35', 'thuc-pham-dong-lanh--c05',
              'trung-dau-hu--c33', 'cham-soc-be--c12', 'do-dung-gia-dinh--c25', 'dien-gia-dung--c26',
              'van-phong-pham-do-choi--c27']

# Headers yêu cầu
headers = {
    'accept': 'application/json',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.9',
    'authorization': 'Bearer',
    'origin': 'https://winmart.vn',
    'priority': 'u=1, i',
    'referer': 'https://winmart.vn/',
    'sec-ch-ua': '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0',
    'x-api-merchant': 'WCM'
}

def crawl_product_winmart():
    data = []
    size = 300

    for category in categories:
        print(f"Crawling category: {category}")

        url = f"https://api-crownx.winmart.vn/it/api/web/v3/item/category?orderByDesc=true&pageNumber=1&pageSize={size}&slug={category}&storeCode=1535&storeGroupCode=1998"

        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            products_data = json.loads(response.text).get("data", {}).get("items", [])
            # append category data to the main data dictionary
            data.extend(products_data)

        else:
            print(f"Error: {response.status_code} for category {category}")
            continue

    custom_put_object(Config.BRONZE_BUCKET_NAME, f"winmart/{now.year}/{now.month:02}/{now.day:02}/product.json", data) 
