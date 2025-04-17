from flask import Blueprint

main = Blueprint('main', __name__)

@main.route('/')
def hello():
    return "Hello, World!"