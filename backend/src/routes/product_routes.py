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
    if not products:
        return jsonify({"error": "No products provided"}), 400
    batch_size = 100
    results = []
    for batch in tqdm(batched(products, batch_size), total=(len(products) // batch_size) + 1):
        result = product_controller.add_products(batch)
        results.append(result[0].json if hasattr(result[0], 'json') else result[0])
    return jsonify({"message": results}), 200

@product_routes.route("/<string:name>", methods=["GET"])
def get_product_by_name(name: str):
    return product_controller.get_product_by_name(name)

@product_routes.route("/re-indexing", methods=["GET"])
def re_indexing():
    return product_controller.re_indexing()
