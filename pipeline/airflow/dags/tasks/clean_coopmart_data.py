import json

import pandas as pd
from tasks.helper import minio_client, Config, custom_put_object
from datetime import datetime

now = datetime.now()

def clean_product_coopmart_data():
    try:
        response = minio_client.get_object(Config.BRONZE_BUCKET_NAME, f"coopmart/{now.year}/{now.month:02}/{now.day:02}/product.json")

        # Đọc dữ liệu và parse từ JSON
        data = json.load(response)
        product_name = set()
        clean_data = []

        for product in data:
            if product['name'] not in product_name:
                product_name.add(product['name'])
                clean_data.append({
                    "name": product.get("name").strip().lower().replace('\"', '').replace('\n', '').replace('\t', '').replace('\r', ''),
                    "price": int(product.get("price")),
                    "img_url": product.get("image").strip(),
                    "unit": product.get("unit").strip(),
                    "category": product.get("category").strip(),
                })
            else:
                print(f"Duplicate product_name found: {product['name']}")
        
        print(f"Total products: {len(clean_data)}")

        clean_data = {
            "products": clean_data
        }

        # Lưu dữ liệu đã làm sạch vào MinIO
        custom_put_object(Config.SILVER_BUCKET_NAME, f"coopmart/{now.year}/{now.month:02}/{now.day:02}/product.json", clean_data)

        # df = pd.DataFrame(clean_data)

        # custom_put_object(Config.SILVER_BUCKET_NAME, f"coopmart/{now.year}/{now.month:02}/{now.day:02}/product.csv", df.to_csv(index=False))

    except Exception as e:
        print(f"Error: {e}")
        raise e
