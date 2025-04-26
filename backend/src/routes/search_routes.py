from flask import Blueprint
from controllers.search_controller import get_plans_controller

search_bp = Blueprint('search', __name__)

search_bp.route('/search', methods=['POST'])(get_plans_controller)
