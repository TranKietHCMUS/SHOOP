from tasks.helper import minio_client, Config

def create_bucket(bucket_name):
    try:
        # Check if the bucket already exists
        if minio_client.bucket_exists(bucket_name):
            print(f"Bucket '{bucket_name}' already exists.")
        else:
            # Create the bucket
            minio_client.make_bucket(bucket_name)
            print(f"Bucket '{bucket_name}' created successfully.")
    except Exception as e:
        print(f"Error creating bucket '{bucket_name}': {e}")
        raise e

def create_all_buckets():
    # Create all required buckets
    create_bucket(Config.BRONZE_BUCKET_NAME)
    create_bucket(Config.SILVER_BUCKET_NAME)
    create_bucket(Config.GOLD_BUCKET_NAME)