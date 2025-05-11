from io import BytesIO
import json
from minio import Minio
import os

class Config:
    END_POINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
    ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    BRONZE_BUCKET_NAME = os.getenv("BRONZE_BUCKET_NAME", "bronze")
    SILVER_BUCKET_NAME = os.getenv("SILVER_BUCKET_NAME", "silver")
    GOLD_BUCKET_NAME = os.getenv("GOLD_BUCKET_NAME", "gold")


minio_client = Minio(
    endpoint=Config.END_POINT,
    access_key=Config.ACCESS_KEY,
    secret_key=Config.SECRET_KEY,
    secure=False,  # Set to True if using HTTPS
)

def custom_put_object(bucket_name, object_name, data):
    try:
        json_bytes = json.dumps(data, ensure_ascii=False, indent=4).encode("utf-8")
        json_file = BytesIO(json_bytes)
        
        minio_client.put_object(
            bucket_name=bucket_name,
            object_name=object_name,
            data=json_file,
            length=len(json_bytes),
            content_type="application/json",
        )
        print(f"Object '{object_name}' uploaded to bucket '{bucket_name}' successfully.")
    except Exception as e:
        print(f"Error uploading object '{object_name}' to bucket '{bucket_name}': {e}")
        raise e