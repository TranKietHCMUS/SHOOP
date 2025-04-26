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
    GGMAP_API_KEY = os.getenv('GGMAP_API_KEY')
    DEBUG = True 
    DIMENSIONS = 768
    VECTOR_WEIGHT = 0.7
    FULL_TEXT_WEIGHT = 0.3
    SECRET_KEY = os.getenv('SECRET_KEY')
    