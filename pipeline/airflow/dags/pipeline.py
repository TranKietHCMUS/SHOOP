import os
import requests
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.utils.dates import days_ago
from tasks.create_bucket import create_all_buckets
from tasks.extract_bhx import crawl_product_bhx
from tasks.extract_winmart import crawl_product_winmart
from tasks.extract_familymart import crawl_product_familymart
from tasks.extract_coopmart import crawl_product_coopmart
from tasks.clean_bhx_data import clean_product_bhx_data
from tasks.clean_winmart_data import clean_product_winmart_data
from tasks.clean_familymart_data import clean_product_familymart_data
from tasks.clean_coopmart_data import clean_product_coopmart_data
from tasks.merge_data import merge_product_data
from tasks.load_to_db import load_to_db
import pytz

vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
now_vn = datetime.now(vn_tz)

BOT_TOKEN = os.getenv('BOT_TOKEN')
CHAT_ID = os.getenv('CHAT_ID')

TELEGRAM_API_URL = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'

def send_message(task_id, status):
    year = str(now_vn.year)
    month = str(now_vn.month).zfill(2)
    day = str(now_vn.day).zfill(2)
    hour = str(now_vn.hour).zfill(2)
    minute = str(now_vn.minute).zfill(2)
    message = f"Task {task_id} {status} at {hour}:{minute} on {month}/{day}/{year}."
    payload = {
        'chat_id': CHAT_ID,
        'text': message
    }
    try:
        response = requests.post(TELEGRAM_API_URL, data=payload)
        if response.status_code == 200:
            print(f"Message sent successfully: {message}")
        else:
            print(f"Failed to send message: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error sending message: {e}")

def task_success_callback(context):
    task_id = context['task_instance'].task_id
    send_message(task_id, 'succeeded')

def task_failure_callback(context):
    task_id = context['task_instance'].task_id
    send_message(task_id, 'failed')

default_args = {
    'owner': 'trkiet',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'on_success_callback': task_success_callback,
    'on_failure_callback': task_failure_callback 
}

with DAG (
    dag_id = 'pipeline',
    default_args=default_args,
    description = 'Grab Shoop pipeline!',
    # start_date = datetime(2024, 11, 20),
    start_date=days_ago(0),
    schedule_interval = '@monthly',
    catchup=False,
) as dag:

    create_all_buckets_task = PythonOperator(
        task_id="create_all_buckets",
        python_callable=create_all_buckets,
        provide_context=True
    )

    crawl_product_bhx_task = PythonOperator(
        task_id="crawl_product_bhx",
        python_callable=crawl_product_bhx,
        provide_context=True
    )

    crawl_product_winmart_task = PythonOperator(
        task_id="crawl_product_winmart",
        python_callable=crawl_product_winmart,
        provide_context=True
    )

    crawl_product_familymart_task = PythonOperator(
        task_id="crawl_product_familymart",
        python_callable=crawl_product_familymart,
        provide_context=True
    )

    crawl_product_coopmart_task = PythonOperator(
        task_id="crawl_product_coopmart",
        python_callable=crawl_product_coopmart,
        provide_context=True
    )

    clean_product_bhx_task = PythonOperator(
        task_id="clean_product_bhx",
        python_callable=clean_product_bhx_data,
        provide_context=True
    )

    clean_product_winmart_task = PythonOperator(
        task_id="clean_product_winmart",
        python_callable=clean_product_winmart_data,
        provide_context=True
    )

    clean_product_familymart_task = PythonOperator(
        task_id="clean_product_familymart",
        python_callable=clean_product_familymart_data,
        provide_context=True
    )

    clean_product_coopmart_task = PythonOperator(
        task_id="clean_product_coopmart",
        python_callable=clean_product_coopmart_data,
        provide_context=True
    )

    merge_product_data_task = PythonOperator(
        task_id="merge_product_data",
        python_callable=merge_product_data,
        provide_context=True
    )

    load_to_db_task = PythonOperator(
        task_id="load_to_db",
        python_callable=load_to_db,
        provide_context=True
    )

    create_all_buckets_task >> crawl_product_bhx_task >> clean_product_bhx_task >> merge_product_data_task
    create_all_buckets_task >> crawl_product_winmart_task >> clean_product_winmart_task >> merge_product_data_task
    create_all_buckets_task >> crawl_product_familymart_task >> clean_product_familymart_task >> merge_product_data_task
    create_all_buckets_task >> crawl_product_coopmart_task >> clean_product_coopmart_task >> merge_product_data_task
    create_all_buckets_task >> crawl_product_bhx_task >> clean_product_bhx_task
    merge_product_data_task >> load_to_db_task