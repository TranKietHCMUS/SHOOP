from src.services.user_service import UserService
from src.extensions import db

user_service = UserService(db)