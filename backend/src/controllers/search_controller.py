from flask import jsonify, request
from pydantic import ValidationError

from src.models.search_model import SearchRequestModel
from src.services.search_service import SearchService

search_service = SearchService(lambda_dist=0.1, preselect_k=3, top_k=3)

def get_plans_controller():
    payload = request.get_json(force=True)
    # validate input
    try:
        req = SearchRequestModel(**payload)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    # get top k plans
    try:
        plans = search_service.get_top_k_plans(
            stores=req.stores,
            groups=req.groups,
            user_loc=req.user_loc
        )
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except RuntimeError as re:
        return jsonify({"error": str(re)}), 500

    return jsonify({"plans": plans}), 200
