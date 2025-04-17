from flask import Flask
from flask_cors import CORS
import logging
import sys
from src.routes.user_route import userBlueprint

def create_app():
    app = Flask(__name__)
    app.config.from_object('config')  # Configuring from Python Files
    CORS(app)

    logging.basicConfig(filename='app.log', level=logging.DEBUG)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logging.getLogger().addHandler(console_handler)

    # Registering Blueprints
    app.register_blueprint(userBlueprint, url_prefix='/api/users')

    return app