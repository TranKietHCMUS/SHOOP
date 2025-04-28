from src.models.product_model import Product
from src.extensions import db
from src.models.product_vec import ProductVec
from src.services.product_vec_service import ProductVecService
from src.services.ai_service import AIService

class ProductService:
    def __init__(self, product_vec_service: ProductVecService, ai_service: AIService):
        self.collection = db.get_collection("products")
        self._ensure_indexes()
        self.product_vec_service = product_vec_service
        self.ai_service = ai_service
    def _ensure_indexes(self):
        try:
            self.collection.create_index([("name", 1)], unique=False, name="name_index")
            self.collection.create_index([("_id", 1)], name="id_unique_index")

            print("Indexes created successfully")
        except Exception as e:
            print(f"Error creating indexes: {e}")

    def validate_product(self, product: Product) -> None:
        if not product.name or not isinstance(product.name, str):
            raise ValueError("Name must be a non-empty string")
        if product.price < 0:
            raise ValueError("Price must be a positive number")
        # if not product.unit or not isinstance(product.unit, str):
        #     raise ValueError("Unit must be a non-empty string")
        if not product.store_name or not isinstance(product.store_name, str):
            raise ValueError("Store name must be a non-empty string")
        # if not product.category or not isinstance(product.category, str):
        #     raise ValueError("Category must be a non-empty string")
        # if not product.img_url or not isinstance(product.img_url, str):
        #     raise ValueError("Image URL must be a non-empty string")
    
    def get_all_products(self) -> list[Product]:
        return [Product(**product) for product in self.collection.find()]
    
    def get_product_by_name(self, name: str) -> Product:
        return self.collection.find_one({"name": name})

    def get_product_by_id(self, id: str) -> Product:
        return self.collection.find_one({"_id": id})

    def insert_one(self, product: Product) -> Product:
        try:
            self.validate_product(product)
            product_vec = self.product_vec_service.find_by_name(product.name)
            if product_vec:
                self.collection.insert_one(product.to_dict())
                return product
            else:
                vector = self.ai_service.get_embeddings(product.name)
                # print("vector", vector.shape)
                product_vec = {"name": product.name, 
                               "vector": vector.tolist()}
                _id = self.product_vec_service.insert_one(product_vec)
                self.collection.insert_one(product.to_dict())
                return product
        except Exception as e:
            print(f"Error inserting product: {e}")
            raise e
    def insert_many(self, products: list[Product]) -> list[Product]:
        cnt = 0
        failed = []
        try:
            for product in products:
                try:
                    self.insert_one(product)
                    cnt += 1
                except Exception as e:
                    print(f"Error inserting product: {e}")
                    failed.append(product.to_dict())
            return cnt, failed
        except Exception as e:
            print(f"Error inserting products: {e}")
            raise e
