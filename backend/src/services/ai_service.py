from src.extensions import AI_MODELS, db, redis, genai
from src.models.ProductVecs import ProductVecs
import json
import os

product_vecs = ProductVecs(db)
sbert = AI_MODELS["sbert"]
geminai = AI_MODELS["genai"]

def prompt_formatting(prompt):
    system_prompt = """
    You are an AI that strictly conforms to responses in JSON formatted strings that is valid when parsed by a JSON parser.
    - Do not use triple backticks (```), even if returning code or JSON.
    - Only output valid JSON with no formatting hints.
    - Your responses consist of valid JSON syntax, with no other comments, explainations, reasoninng, or dialogue not consisting of valid JSON.

    Hãy trích xuất thông tin từ bất kỳ văn bản nào được gửi tới, và trả về kết quả theo đúng định dạng JSON với các trường sau:
    - items: danh sách các sản phẩm, mỗi sản phẩm có các trường:
        - product_name: tên sản phẩm (là chuỗi)
        - quantity: số lượng (là số nguyên)
        - unit: đơn vị tính (là chuỗi)
    - total_price: tổng giá tiền (là số thực)
    Sản phẩm có thể là bất kì thứ gì đến từ siêu thị, cửa hàng tiện lợi, ...
    Chỉ trả về kết quả dưới dạng nội dung JSON hợp lệ. Không thêm giải thích hay văn bản khác.
    Sau đây là văn bản:
    """


    response = geminai.models.generate_content(
        model="gemini-2.0-flash", contents=(system_prompt + prompt)
    )

    raw_text = response.text.strip()
    if raw_text.startswith("```") and raw_text.endswith("```"):
        raw_text = "\n".join(raw_text.split("\n")[1:-1])

    try:
        result = json.loads(raw_text)
        return result
    except json.JSONDecodeError:
        return {
            "error": "Cannot parse JSON. The response is:" + raw_text
        }

def get_embeddings(sentences):
    embeddings = sbert.encode(sentences)
    return embeddings    

def search_products(embeddings, product_names):
    res = []
    for embedding, product_name in zip(embeddings, product_names):    
        results = product_vecs.search(embedding.tolist(), product_name)
        res.append(results)
    return res

def insert_products(products):
    success = product_vecs.insert_many(products)
    return success
