from flask import Flask
from flask_cors import CORS
from .database import MongoDB
from .config import Config
import logging
import sys

from src.routes.user_routes import user_routes
from src.routes.ai_routes import ai_routes
from src.routes.product_routes import product_routes
from src.routes.store_routes import store_routes
from src.routes.auth_routes import auth_routes
from src.routes.search_routes import search_bp
from src.extensions import db, redis, AI_MODELS
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Cấu hình CORS an toàn hơn
    PROD_ENV = Config.PROD_ENV
    allowed_origins = []
    
    # Thêm origins từ biến môi trường
    if PROD_ENV == 'False':
        try:
            env_origins = Config.CORS_ORIGINS.split(',')
            allowed_origins.extend([origin.strip() for origin in env_origins if origin.strip()])
        except Exception as e:
            print(f"Error parsing CORS_ORIGINS: {e}")
    # print(f"CORS allowed origins: {allowed_origins}")
        CORS(app, 
            resources={r"/*": {"origins": allowed_origins}},
            supports_credentials=True,
            allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
            methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            expose_headers=["Content-Type", "Authorization"])
    
    # Khởi tạo database
    logging.basicConfig(filename='app.log', level=logging.DEBUG)
    
    # Registering Blueprints
    app.register_blueprint(user_routes)
    app.register_blueprint(ai_routes)
    app.register_blueprint(product_routes)
    app.register_blueprint(store_routes)
    app.register_blueprint(auth_routes)
    app.register_blueprint(search_bp)

    return app