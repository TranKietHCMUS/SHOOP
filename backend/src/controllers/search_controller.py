from flask import jsonify, request
from pydantic import ValidationError

from src.models.search_model import SearchRequestModel, StoreSearchRequestModel
from src.services.search_service import SearchService
from src.services.store_service import StoreService

class SearchController:
    def __init__(self):
        self.search_service = SearchService(lambda_dist=0.1, preselect_k=3, top_k=3)
        self.store_service = StoreService()

    def get_plans(self, request):
        payload = request.get_json(force=True)
        # validate input
        try:
            req = SearchRequestModel(**payload)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        # get top k plans
        try:
            plans = self.search_service.get_top_k_plans(
                stores=req.stores,
                groups=req.groups,
                user_loc=req.user_loc
            )
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except RuntimeError as re:
            return jsonify({"error": str(re)}), 500

        return jsonify({"plans": plans}), 200

    def get_stores_within_radius(self, request):
        payload = request.get_json(force=True)
        try:
            req = StoreSearchRequestModel(**payload)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        try:
            stores = self.store_service.get_stores_within_radius(req.lat, req.lng, req.radius)
            return jsonify({
                "message": "Stores fetched successfully",
                "data": {"stores": stores}
            }), 200
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500
