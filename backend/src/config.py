from pymongo import MongoClient
import os
from dotenv import load_dotenv


load_dotenv()

class Config:
    MONGODB_URI = os.getenv('MONGODB_URI')
    DB_NAME = os.getenv('DB_NAME', 'grab')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = os.getenv('REDIS_PORT', 6379)
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    GGMAP_API_KEY = os.getenv('GGMAP_API_KEY')
    DEBUG = True 
    DIMENSIONS = 768
    VECTOR_WEIGHT = 0.6
    FULL_TEXT_WEIGHT = 0.2
    UNIT_WEIGHT = 0.2
    SECRET_KEY = os.getenv('SECRET_KEY')
    UNIT_VARIATIONS = {
        "hộp": ["hop", "box", "h"],
        "chai": ["bottle", "btl", "ch"],
        "lon": ["can", "l"],
        "lốc": ["pack", "loc"],
        "kg": ["kilograms", "kilogram", "kilo"],
        "g": ["gram", "grams"],
        "túi": ["tui", "bag"],
        "gói": ["goi", "packet"],
        "ml": ["milliliter", "milliliters"],
        "l": ["liter", "liters"],
        "thùng": ["thung", "carton", "case"],
        "cái": ["piece", "cai"],
        "vỉ": ["strip", "vi"],
        "khay": ["tray", "khay"],
        "viên": ["vien", "tablet"],
    }
