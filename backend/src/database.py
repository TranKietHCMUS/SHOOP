from pymongo import MongoClient
from src.config import Config

class MongoDB:
    def __init__(self, db_name:str = Config.DB_NAME) -> None:
        self.client = MongoClient(Config.MONGODB_URI)
        try:
            self.client.admin.command('ping')
            print("Connected to MongoDB...")
            self.database = self.client[db_name]
            print(f"Database {db_name} connected...")
        except Exception as e:
            print(e)
            
    def ping(self):
        self.client.admin.command('ping')
        
    def get_collection(self, collection_name):
        collection = self.database[collection_name]
        return collection
        
    def __call__(self):
        return self.database 