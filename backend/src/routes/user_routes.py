from flask import Blueprint, request
from src.controllers.user_controller import UserController
from src.middlewares.verify_token import token_required

user_routes = Blueprint("user", __name__, url_prefix="/user")
user_controller = UserController()
# did not have authentication yet
# -> add later
@user_routes.route("/search", methods=["POST"])
def search():
    message, status_code = user_controller.handle_user_search(request.json)
    return message, status_code

@user_routes.route("/history", methods=["GET"])
@token_required
def get_search_history():
    return user_controller.get_search_history(request)

@user_routes.route("/history/clear", methods=["DELETE"])
@token_required
def clear_all_history():
    return user_controller.clear_all_history(request)

@user_routes.route("/history/delete", methods=["DELETE"])
@token_required
def delete_history_by_index():
    return user_controller.delete_history_by_index(request)