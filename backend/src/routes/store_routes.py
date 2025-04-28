from flask import Blueprint, request, jsonify
from src.controllers.store_controller import StoreController
from src.utils import batched
from tqdm import tqdm

store_routes = Blueprint("store", __name__, url_prefix="/store")
store_controller = StoreController()

@store_routes.route("/", methods=["GET"])
def get_stores():
    return store_controller.get_stores()

@store_routes.route("/admin/insert", methods=["POST"])
def insert_stores():
    data = request.json
    stores = data.get("stores")
    length = len(stores)
    batch_size = 100  
    results = []
    for batch in tqdm(batched(stores, batch_size), total=length//batch_size):
        # print("batch", batch)
        failed, status = store_controller.add_stores(batch)
        if status != 200:
            results.append(f"Batch failed: {failed}")
        else:
            results.append(failed)
    return jsonify({"message": f"{results}"}), 200

@store_routes.route("/<string:name>", methods=["GET"])
def get_store_by_name(name: str):
    return store_controller.get_store_by_name(name)



