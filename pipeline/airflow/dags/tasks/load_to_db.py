import requests
import json
from tasks.helper import minio_client, Config
from datetime import datetime

now = datetime.now()


def load_to_db():
    minio_response = minio_client.get_object(Config.BRONZE_BUCKET_NAME, f"bhx/{now.year}/{now.month:02}/{now.day:02}/product.json")

    data = json.load(minio_response)

    url = 'http://localhost:5000/product/admin/insert'

    response = requests.post(url, json=data)

    print(f'Status Code: {response.status_code}')
    print(f'Response: {response.text}')