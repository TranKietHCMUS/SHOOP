from src.extensions import db
from src.services.product_vec_service import ProductVecService
from src.services.ai_service import AIService
from src.services.user_service import UserService

product_vec_service = ProductVecService(db)
ai_service = AIService(product_vec_service=product_vec_service)
user_service = UserService(ai_service=ai_service)
