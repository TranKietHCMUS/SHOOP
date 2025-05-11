from flask import Blueprint, request, jsonify
from src.controllers.store_controller import StoreController
from src.utils import batched
from tqdm import tqdm
from src.models.store_model import Store
import traceback

store_routes = Blueprint("store", __name__, url_prefix="/store")
store_controller = StoreController()

@store_routes.route("/", methods=["GET"], strict_slashes=False)
def get_stores():
    try:
        name = request.args.get("name")
        res = []
        if name:
            res = store_controller.get_store_by_name(name)
        else:
            res = store_controller.get_stores()
        res = [store.to_dict() for store in res]
        return jsonify({"message": res}), 200
    except Exception as e:
        print(f"Error in get_stores: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    

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



