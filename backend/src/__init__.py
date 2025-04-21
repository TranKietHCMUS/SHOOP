from flask import Flask
from flask_cors import CORS
from .database import MongoDB
from .config import Config
import logging
import sys

from src.routes.user_routes import user_routes
from src.routes.ai_routes import ai_routes

from src.extensions import db, redis, AI_MODELS

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Load config
    app.config.from_object(Config)
    
    # Khởi tạo database
    logging.basicConfig(filename='app.log', level=logging.DEBUG)
    # console_handler = logging.StreamHandler(sys.stdout)
    # console_handler.setLevel(logging.DEBUG)
    # formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    # console_handler.setFormatter(formatter)
    # logging.getLogger().addHandler(console_handler)

    # Registering Blueprints
    app.register_blueprint(user_routes)
    app.register_blueprint(ai_routes)

    return app