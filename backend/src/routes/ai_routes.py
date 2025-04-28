from flask import Blueprint, request, jsonify, Response
from src.extensions import AI_MODELS
from src.controllers.ai_controller import AIController
from tqdm import tqdm
from src.utils import batched

ai_routes = Blueprint("ai", __name__, url_prefix="/ai")
ai_controller = AIController()
sbert = AI_MODELS["sbert"]


@ai_routes.route("/admin/insert", methods=["POST"])
def insert():
    data = request.json
    products = data.get("products")
    batch_size = 100  
    results = []

    for batch in tqdm(batched(products, batch_size)):
        vectors = sbert.encode(batch)
        
        new_products = [{
            "name": product,
            "vector": vector.tolist()
        } for product, vector in zip(batch, vectors)]
        
        message, status = ai_controller.insert_vec_products(new_products)
        if status != 200:
            results.append(f"Batch failed: {message}")
        else:
            results.append(f"Batch processed: {len(new_products)} items")
    
    return {"message": "Processing completed", "details": results}, 200