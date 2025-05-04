from flask import Blueprint, request, jsonify
from src.controllers.search_controller import SearchController
from src.middlewares.verify_token import token_required

search_bp = Blueprint("search", __name__, url_prefix="/api/search")
search_controller = SearchController()

# POST /search/plans
@search_bp.route("/plans", methods=["POST"])
@token_required
def get_plans_route():
    return search_controller.get_plans(request)

# POST /search/nearby
@search_bp.route("/nearby", methods=["POST"])
@token_required
def search_nearby_route():
    return search_controller.search_nearby(request)
