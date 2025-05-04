from src.extensions import db
from src.services.ai_service import AIService
from src.services.user_service import UserService
from src.services.product_service import ProductService
from src.services.store_service import StoreService

ai_service = AIService()
product_service = ProductService(ai_service=ai_service)
user_service = UserService(ai_service=ai_service, 
                           product_service=product_service,
                           db=db)
store_service = StoreService(ai_service=ai_service)