import time
import requests
import json
from tasks.helper import custom_put_object, Config
from datetime import datetime

now = datetime.now()

categories = ['thit-heo', 'thit-bo', 'thit-ga', 'thit-so-che', 'ca-tom-muc-ech', 'trung'
                  'trai-cay-tuoi-ngon', 'rau-sach', 'cu', 'nam-tuoi', 'rau-cu-cat-san', 'rau-cu-dong-lanh',
                  'bia', 'nuoc-tra', 'nuoc-ngot', 'nuoc-tang-luc', 'nuoc-suoi-khoang', 'nuoc-yen', 
                  'nuoc-ep-trai-cay', 'sua-trai-cay', 'siro', 'ruou-ngon-cac-loai', 'ca-phe-hoa-tan', 'tra-kho-tui-loc',
                  'ca-phe-phin', 'ca-phe-lon', 'mat-ong', 'sua-tuoi', 'sua-ca-cao-socola', 'sua-chua', 'sua-bot-cong-thuc',
                  'sua-tu-hat', 'sua-dac', 'yen-mach-ngu-coc', 'sua-chua-an', 'pho-mai-an', 'gao-gao-nep',
                  'xuc-xich', 'ca-hop', 'mi-chay', 'thit-heo-hop', 'tuong-chao', 'thuc-pham-chay', 'bot-che-bien-san',
                  'dau-cac-loai', 'rong-bien', 'lap-xuong', 'ca-mam', 'banh-phong-tom', 'banh-trang', 'nuoc-cot-dua',
                  'bot-ngu-coc', 'dau-an', 'nuoc-mam', 'nuoc-tuong', 'duong', 'hat-nem', 'muoi-an', 'tuong-ot-ca-den',
                  'bo', 'gia-vi-nem-san', 'sot-nuoc-cham', 'tieu', 'bot-gia-vi', 'mi', 'hu-tieu', 'pho', 'chao-an-lien',
                  'bun-kho', 'nui-kho', 'mien-kho', 'mi-kho', 'tokbokki', 'kem', 'sua-chua-men-song', 'banh-caramen-banh-flan',
                  'cha-gio', 'xuc-xich-tuoi', 'banh-dong-cac-loai', 'gio-cha', 'dau-hu-dau-hu-trung', 'ca-vien-bo-vien',
                  'ca-hai-san-dong-lanh', 'thuc-pham-che-bien-san', 'do-chua-dua-muoi', 'ha-cao-sui-cao-xiu-mai',
                  'rau-cu-lam-san', 'nuoc-lau-vien-tha-lau', 'banh-quy', 'banh-ngot', 'banh-bong-lan', 'banh-chocopie-kitkat',
                  'snack', 'banh-gao', 'banh-dua', 'banh-que', 'keo-cung', 'keo-mem', 'singum-keo-cao-su', 'cac-loai-kho-an-lien',
                  'trai-cay-say', 'cac-loai-hat', 'rau-cau', 'banh-xop', 'cac-loai-mut', 'do-kho-an-lien-khac',
                  'socola', 'tay-trang', 'sua-rua-mat', 'mat-na-danh-cho-mat', 'nuoc-hoa-hong', 'serum-tinh-chat', 'kem-duong-da',
                  'kem-chong-nang', 'khau-trang', 'kem-danh-rang', 'nuoc-suc-mieng', 'ban-chai-danh-rang', 'dau-goi',
                  'dau-xa', 'sua-tam', 'sua-duong-the', 'lan-xit-khu-mui', 'giay-ve-sinh', 'khan-giay', 'khan-giay-uot',
                  'nuoc-rua-tay', 'xa-bong-cuc', 'bao-cao-su', 'bang-ve-sinh', 'dung-dich-ve-sinh', 'dung-cu-cao-rau',
                  'bong-ray-tai', 'kem-u-duong-toc', 'kem-tay-long', 'thuoc-nhuom-toc', 'nuoc-giat', 'nuoc-xa',
                  'bot-giat', 'nuoc-rua-chen', 'nuoc-lau-nha', 'tay-rua-bon-cau-nha-tam', 'diet-con-trung',
                  'sap-thom-tui-thom', 'kem-tay-lau-da-nang', 'nuoc-tay-quan-ao', 'tui-dung-rac', 'tam-goi-2-trong-1-cho-be',
                  'sua-tam-cho-be', 'nuoc-xa-vai-cho-be', 'nuoc-giat-cho-tre', 'kem-danh-rang-cho-be', 'ban-chai-danh-rang-cho-be',
                  'khau-trang-cho-be', 'phan-thom-cham-soc-da-be', 'binh-sua-cho-be', 'pin-tieu', 'mang-boc-thuc-pham-tui-zipper',
                  'to-chen-dia-dung-mot-lan', 'hop-dung-thuc-pham', 'chao-chong-dinh', 'dao', 'ro-thau', 'binh-giu-nhiet',
                  'lot-noi-nhac-noi', 'khan-lau-tap-de', 'co-noi', 'dung-cu-chui-rua', 'khan-tam', 'but-thuoc-gom-tay', 'do-van-phong-khac']

headers = {
    "accept": "application/json, text/plain, */*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.9",
    "authorization": "Bearer 762ACA93F95C0786B0A9611700F646E2",  # <-- Token này có thể hết hạn, bạn cần thay mới nếu lỗi
    "connection": "keep-alive",
    "content-type": "application/json",
    "customer-id": "",
    "deviceid": "79d6dfe0-2b4e-4781-a6db-9740e714839a",
    "host": "apibhx.tgdd.vn",
    "origin": "https://www.bachhoaxanh.com",
    "platform": "webnew",
    "referer": "https://www.bachhoaxanh.com/",
    "referer-url": "https://www.bachhoaxanh.com/",
    "reversehost": "http://bhxapi.live",  # rất quan trọng
    "sec-ch-ua": '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0",
    "xapikey": "bhx-api-core-2022"
}

def crawl_product_bhx1():
    data = []
    size = 300

    for category in categories:
        print(f"Crawling category: {category}")
        url = f"https://apibhx.tgdd.vn/Category/V2/GetCate?provinceId=3&wardId=0&districtId=0&storeId=2546&categoryUrl={category}&isMobile=true&isV2=true&pageSize={size}"
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            products_data = json.loads(response.text).get('data', {}).get('products', [])
            data.extend(products_data)
        else:
            print(f"Error: {response.status_code} for category {category}")
            continue
        time.sleep(1)
    
    return data


def crawl_product_bhx2():
    url = "https://apibhx.tgdd.vn/Category/AjaxProduct"

    with open("/opt/airflow/data/bhx_category_ids.json", "r", encoding="utf-8") as f:
        category_ids = json.load(f)

    category_ids = category_ids.get("category_ids", [])
    print(f"Total categories: {len(category_ids)}")

    data = []

    PAGE_SIZE = 10

    for category_id in category_ids:
        print(f"Crawling category: {category_id}")
        for page_index in range(1, PAGE_SIZE + 1):
            payload = {
                "provinceId": 3,
                "wardId": 10164,
                "districtId": 20,
                "storeId": 4823,
                "CategoryId": category_id,
                "SelectedBrandId": "",
                "PageIndex": page_index,
                "PageSize": PAGE_SIZE,
                "PriorityProductIds": "",
                "PropertyIdList": "",
                "PropertySelected": [],
                "SortStr": "",
                "LastShowProductId": 0,
                "reqs": []
            }

            response = requests.post(url, headers=headers, json=payload)
            try:
                if response.status_code == 200:
                    products_data = json.loads(response.text).get('data', {}).get('products', [])
                    data.extend(products_data)
                else:
                    print(f"HTTP {response.status_code} - {response.text}")
            except Exception as e:
                print(f"Error: {e}")

            time.sleep(1)

    return data

def crawl_product_bhx():
    data = crawl_product_bhx1() + crawl_product_bhx2()
    custom_put_object(Config.BRONZE_BUCKET_NAME, f"bhx/{now.year}/{now.month:02}/{now.day:02}/product.json", data)