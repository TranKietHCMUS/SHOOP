from flask import Blueprint, request
from src.controllers.search_controller import SearchController

search_bp = Blueprint("search", __name__, url_prefix="/search")
search_controller = SearchController()

# POST /search/plans
search_bp.route("/plans", methods=["POST"])(lambda: search_controller.get_plans(request))
# POST /search/nearby
search_bp.route("/nearby", methods=["POST"])(lambda: search_controller.get_stores_within_radius(request))