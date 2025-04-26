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

@user_routes.route("/hello", methods=["GET"])
@token_required
def hello():
    return "Hello, World!", 200