import json
from tasks.helper import minio_client, Config, custom_put_object
from datetime import datetime
# import pytz

# vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
now = datetime.now()

def merge_product_data():
    try:
        # Get cleaned data from SILVER bucket
        response_familymart = minio_client.get_object(Config.SILVER_BUCKET_NAME, f"familymart/{now.year}/{now.month:02}/{now.day:02}/product.json")
        response_bhx = minio_client.get_object(Config.SILVER_BUCKET_NAME, f"bhx/{now.year}/{now.month:02}/{now.day:02}/product.json")
        response_winmart = minio_client.get_object(Config.SILVER_BUCKET_NAME, f"winmart/{now.year}/{now.month:02}/{now.day:02}/product.json")
        response_coopmart = minio_client.get_object(Config.SILVER_BUCKET_NAME, f"coopmart/{now.year}/{now.month:02}/{now.day:02}/product.json")

        # Read and parse JSON data
        data_familymart = json.load(response_familymart)["products"]
        data_bhx = json.load(response_bhx)["products"]
        data_winmart = json.load(response_winmart)["products"]
        data_coopmart = json.load(response_coopmart)["products"]

        for product in data_bhx:
            product["store_name"] = "Bách hóa xanh"
        
        for product in data_familymart:
            product["store_name"] = "FamilyMart"
        
        for product in data_winmart:
            product["store_name"] = "WinMart"
        
        for product in data_coopmart:
            product["store_name"] = "CoopMart"

        # Merge data
        merged_data = {
            "products": data_familymart + data_bhx + data_winmart + data_coopmart
        }

        # for product in merged_data["products"]:
        #     product["crawl_at"] = now.strftime("%Y-%m-%d %H:%M:%S")

        # Save merged data to GOLD bucket
        custom_put_object(Config.GOLD_BUCKET_NAME, f"{now.year}/{now.month:02}/{now.day:02}/product.json", merged_data)

    except Exception as e:
        print(f"Error: {e}")
        raise e