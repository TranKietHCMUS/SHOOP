from pymongo import MongoClient
import os
from dotenv import load_dotenv


load_dotenv()

class Config:
    PROD_ENV = os.getenv('PROD_ENV')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS')
    MONGODB_URI = os.getenv('MONGODB_URI')
    DB_NAME = os.getenv('DB_NAME', 'grab')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = os.getenv('REDIS_PORT', 6379)
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    GGMAP_API_KEY = os.getenv('GGMAP_API_KEY')
    ORS_API_KEY = os.getenv('ORS_API_KEY')
    DEBUG = True 
    DIMENSIONS = 768
    VECTOR_WEIGHT = 0.7
    FULL_TEXT_WEIGHT = 0.3
    UNIT_WEIGHT = 0.2
    SECRET_KEY = os.getenv('SECRET_KEY')
    UNIT_VARIATIONS = {
        "hộp": ["hop", "h"],
        "chai": ["ch", "lọ"],
        "lon": ["l"],
        "lốc": ["loc", "vỉ", "bó"],
        "kg": ["ký", "kí", "kilô"],
        "g": ["gam"],
        "túi": ["tui", "bao"],
        "gói": ["goi", "bịch"],
        "ml": ["mililit"],
        "l": ["lít"],
        "thùng": ["thung", "thg"],
        "cái": ["cai", "chiếc"],
        "vỉ": ["vi", "tấm"],
        "khay": ["khay"],
        "viên": ["vien", "liều"],
    }

