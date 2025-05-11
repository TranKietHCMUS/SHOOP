import time
import requests
import json
from datetime import datetime
from tasks.helper import Config, custom_put_object

now = datetime.now()

headers = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "origin": "https://cooponline.vn",
    "referer": "https://cooponline.vn/groups/gia-vi-nem/",
    "sec-ch-ua": '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0",
    "x-requested-with": "XMLHttpRequest",
}

with open("/opt/airflow/data/coopmart_item_ids.json", "r", encoding="utf-8") as f:
    item_ids = json.load(f)

term_ids = {
    "Rau củ trái cây": "3917",
    "Thịt, trứng, hải sản": "3918",
    "Thức ăn chế biến, bún tươi": "3919",
    "Thực phẩm đông mát": "3920",
    "Bánh, kẹo, snack": "3921",
    "Sữa, sản phẩm từ sữa": "3922",
    "Thức uống": "3923",
    "Gia vị, gạo, thực phẩm khô": "3924",
    "Sản phẩm cho bé": "3925",
    "Chăm sóc cá nhân": "3926",
    "Nhà cửa và đời sống": "3927",
}

url = "https://cooponline.vn/ajax/"


def fetch_all_products(item_ids_chunk, category):
    all_products = []
    page = 1
    while True:
        payload = {
            "request": "w_getProductsTaxonomy",
            "termid": term_ids[category],
            "taxonomy": "groups",
            "store": "151",
            "items": ",".join(str(i) for i in item_ids_chunk),
            "trang": str(page)
        }
        response = requests.post(url, headers=headers, data=payload)
        if response.ok:
            data = response.json()
            if not data:
                break  # hết trang
            for item in data:
                item["category"] = category
            all_products.extend(data)
            page += 1
            time.sleep(0.5)  # tránh gửi quá nhanh
        else:
            print("Request failed at page", page)
            break
    return all_products


def crawl_product_coopmart():
    final_products = []
    seen = set()
    deduped_item_ids = {}

    for category, ids in item_ids.items():
        unique_ids = []
        for item_id in ids:
            if item_id not in seen:
                unique_ids.append(item_id)
                seen.add(item_id)
        deduped_item_ids[category] = unique_ids
    for category, ids in deduped_item_ids.items():
        if not ids:
            continue
        print(f"Đang xử lý category: {category} ({len(ids)} sản phẩm)...")
        products = fetch_all_products(ids, category)
        print(f"Đã lấy {len(products)} sản phẩm cho category: {category}")
        
        final_products.extend(products)
    
    custom_put_object(Config.BRONZE_BUCKET_NAME, f"coopmart/{now.year}/{now.month:02}/{now.day:02}/product.json", final_products)
