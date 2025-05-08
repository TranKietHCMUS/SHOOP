from flask import Blueprint, request, jsonify
from src.controllers.product_controller import ProductController
from src.utils import batched
from tqdm import tqdm

product_routes = Blueprint("product", __name__, url_prefix="/product")
product_controller = ProductController()

@product_routes.route("/", methods=["GET"])
def get_products():
    return product_controller.get_products()

@product_routes.route("/admin/insert", methods=["POST"])
def insert_products():
    data = request.json
    products = data.get("products")
    length = len(products)
    batch_size = 100  
    results = []
    for batch in tqdm(batched(products, batch_size), total=length//batch_size):
        # print("batch", batch)
        message, status = product_controller.add_products(batch)
        if status != 200:
            results.append(f"Batch failed: {message}")
        else:
            results.append(message)
    return jsonify({"message": f"\n{results}"}), 200

    

@product_routes.route("/<string:name>", methods=["GET"])
def get_product_by_name(name: str):
    return product_controller.get_product_by_name(name)

@product_routes.route("/re-indexing", methods=["GET"])
def re_indexing():
    res = product_controller.re_indexing()
    return jsonify({"message": "Re-indexing products successfully"}), 200 if res else 500
