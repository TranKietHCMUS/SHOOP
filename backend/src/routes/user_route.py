from flask import Blueprint
from src.controllers.user_controller import hello

userBlueprint = Blueprint('main', __name__)

userBlueprint.route('/', methods=['GET'])(hello)