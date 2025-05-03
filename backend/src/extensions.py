import redis
from sentence_transformers import SentenceTransformer
from google import genai
from src.database import MongoDB
from src.config import Config

db = MongoDB(db_name=Config.DB_NAME)    

redis = redis.Redis.from_url(Config.REDIS_URL, decode_responses=True)

AI_MODELS = {
    "sbert": SentenceTransformer("VoVanPhuc/sup-SimCSE-VietNamese-phobert-base"),
    "genai": genai.Client(api_key=Config.OPENAI_API_KEY)
}

