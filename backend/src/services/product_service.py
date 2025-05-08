from src.models.product_model import Product
from src.extensions import db
from src.services.ai_service import AIService
from src.config import Config
from bson.objectid import ObjectId
from pymongo.operations import SearchIndexModel
from typing import List, Dict, Any
import numpy as np
from datetime import datetime
from tqdm import tqdm

class ProductService:
    def __init__(self, ai_service: AIService):
        self.collection = db.get_collection("products")
        self._ensure_indexes()
        self.ai_service = ai_service
        
    def _ensure_indexes(self):
        try:
            self.collection.create_index(
                [("name", 1), ("unit", 1), ("store_name", 1)], 
                unique=True, 
                name="name_unit_store_unique_index"
            )
            
            self.collection.create_index([("_id", 1)], name="id_unique_index")
            
            self.collection.create_index([("name", "text")], name="name_text_index")
            
            vector_index_model = SearchIndexModel(
                definition={
                    "fields": [
                        {
                            "type": "vector",
                            "numDimensions": Config.DIMENSIONS,
                            "similarity": "cosine",
                            "path": "vector",
                            "quantization": "scalar"
                        }
                    ]
                },
                name="vector_index",
                type="vectorSearch"
            )

            text_index_model = SearchIndexModel(
                definition={
                    "mappings": {
                        "dynamic": False,
                        "fields": {
                            "name": {
                                "type": "string"
                            },
                            "unit": {
                                "type": "string"
                            }
                        }
                    }
                },
                name="product_text_index",
                type="search"
            )

            try:
                existing_indexes = self.collection.list_search_indexes()
                vector_index_exists = any(idx.get("name") == "vector_index" for idx in existing_indexes)
                text_index_exists = any(idx.get("name") == "product_text_index" for idx in existing_indexes)
                
                if not vector_index_exists:
                    self.collection.create_search_index(model=vector_index_model)
                    print("Vector search index created successfully")
                
                if not text_index_exists:
                    self.collection.create_search_index(model=text_index_model)
                    print("Text search index created successfully")
                    
                print("Search indexes verified successfully")
            except Exception as e:
                print(f"Error checking or creating search indexes: {e}")
                try:
                    self.collection.create_search_index(model=vector_index_model)
                    self.collection.create_search_index(model=text_index_model)
                    print("Search indexes created")
                except Exception as e2:
                    print(f"Failed to create search indexes: {e2}")
                
            print("All indexes created or verified successfully")
        except Exception as e:
            print(f"Error creating indexes: {e}, full error: {str(e)}")

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
        if product.vector and not isinstance(product.vector, list):
            raise ValueError("Vector must be a list of float values")
        if product.vector and len(product.vector) != Config.DIMENSIONS:
            raise ValueError(f"Vector must have exactly {Config.DIMENSIONS} dimensions")
    
    def validate_vector(self, vector):
        """Validate and normalize the vector"""
        if not isinstance(vector, list):
            raise ValueError("Vector must be a list")
        
        if len(vector) != Config.DIMENSIONS:
            raise ValueError(f"Vector must have exactly {Config.DIMENSIONS} dimensions")
        
        for dim in vector:
            if not isinstance(dim, (int, float)):
                raise ValueError("Vector dimensions must be numeric values")
        
        return vector
    
    def get_all_products(self) -> list[Product]:
        return [Product(**product) for product in self.collection.find()]
    
    def get_product_by_name(self, name: str) -> Product:
        data = self.collection.find_one({"name": name})
        return Product(**data) if data else None

    def get_product_by_id(self, id: str) -> Product:
        data = self.collection.find_one({"_id": ObjectId(id)})
        return Product(**data) if data else None

    def insert_one(self, product: Product) -> Product:
        try:
            self.validate_product(product)
            
            if not product.vector:
                vector = self.ai_service.get_embeddings(product.name + product.unit)
                product.vector = vector.tolist()
            else:
                product.vector = self.validate_vector(product.vector)
                
            self.collection.insert_one(product.to_dict())
            return product
        except Exception as e:
            print(f"Error inserting product: {e}")
            raise e
            
    def insert_many(self, products: list[Product]) -> tuple[int, list[dict]]:
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
            
    def update_by_id(self, id: str, update_data: dict) -> bool:
        try:
            current = self.get_product_by_id(id)
            if not current:
                raise ValueError(f"Not found product with id {id}")

            if "name" in update_data and update_data["name"] != current.name:
                vector = self.ai_service.get_embeddings(update_data["name"])
                update_data["vector"] = vector.tolist()
            elif "vector" in update_data:
                update_data["vector"] = self.validate_vector(update_data["vector"])
                
            result = self.collection.update_one(
                {"_id": ObjectId(id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating product: {e}")
            raise e

    def delete_by_id(self, id: str) -> bool:
        try:
            result = self.collection.delete_one({"_id": ObjectId(id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting product: {e}")
            return False
            
    def search(self, query_vector: list[float], product_name: str = None, unit: str = None, top_k: int = 10) -> list[dict]:
        try:
            query_vector = self.validate_vector(query_vector)
            results = {}

            print(f"Query vector: {query_vector[:5]}... (length: {len(query_vector)})")
            print(f"Searching for product name: '{product_name}', unit: '{unit}'")

            if query_vector:
                vector_pipeline = [
                    {
                        "$vectorSearch": {
                            "index": "vector_index",
                            "path": "vector",
                            "queryVector": query_vector, 
                            "numCandidates": 100,
                            "limit": 100 
                        }
                    },
                    {
                        "$project": {
                            "_id": 1,
                            "name": 1,
                            "price": 1,
                            "unit": 1,
                            "store_name": 1,
                            "category": 1,
                            "img_url": 1,
                            "created_at": 1,
                            "updated_at": 1,
                            "vs_score": {"$meta": "vectorSearchScore"}
                        }
                    }
                ]
                
                vector_results = list(self.collection.aggregate(vector_pipeline))
                
                # Process vector results
                for doc in vector_results:
                    doc_id = str(doc["_id"])
                    results[doc_id] = {
                        "_id": doc["_id"],
                        "name": doc["name"],
                        "price": doc.get("price"),
                        "unit": doc.get("unit"),
                        "store_name": doc.get("store_name"),
                        "category": doc.get("category"),
                        "img_url": doc.get("img_url"),
                        "created_at": doc.get("created_at"),
                        "updated_at": doc.get("updated_at"),
                        "vs_score": doc["vs_score"] * Config.VECTOR_WEIGHT,
                        "fts_score": 0,
                        "unit_score": 0
                    }

            if product_name:
                text_pipeline = [
                    {
                        "$search": {
                            "index": "product_text_index",
                            "text": {
                                "query": product_name,
                                "path": "name"
                            }
                        }
                    },
                    {
                        "$project": {
                            "_id": 1,
                            "name": 1,
                            "price": 1,
                            "unit": 1,
                            "store_name": 1,
                            "category": 1,
                            "img_url": 1,
                            "created_at": 1,
                            "updated_at": 1,
                            "fts_score": {"$meta": "searchScore"}
                        }
                    },
                    {"$limit": 100}
                ]
                
                text_results = list(self.collection.aggregate(text_pipeline))
                
                for doc in text_results:
                    doc_id = str(doc["_id"])
                    if doc_id in results:
                        results[doc_id]["fts_score"] = doc["fts_score"] * Config.FULL_TEXT_WEIGHT
                    else:
                        results[doc_id] = {
                            "_id": doc["_id"],
                            "name": doc["name"],
                            "price": doc.get("price"),
                            "unit": doc.get("unit"),
                            "store_name": doc.get("store_name"),
                            "category": doc.get("category"),
                            "img_url": doc.get("img_url"),
                            "created_at": doc.get("created_at"),
                            "updated_at": doc.get("updated_at"),
                            "vs_score": 0,
                            "fts_score": doc["fts_score"] * Config.FULL_TEXT_WEIGHT,
                            "unit_score": 0
                        }

            for doc_id, doc in results.items():
                doc["initial_score"] = doc["vs_score"] + doc["fts_score"]

            initial_results = list(results.values())
            initial_results.sort(key=lambda x: x["initial_score"], reverse=True)
            
            rerank_candidates = initial_results[:min(100, len(initial_results))]
            
            
            if unit and rerank_candidates:
                
                for doc in rerank_candidates:
                    doc_id = str(doc["_id"])
                    if doc_id in results and doc.get("unit"):
                        unit_score = self.ai_service.unit_similarity_score(doc.get("unit"), unit) * Config.UNIT_WEIGHT
                        results[doc_id]["unit_score"] = unit_score

            final_results = list(results.values())
            for doc in final_results:
                doc["score"] = doc["vs_score"] + doc["fts_score"] + doc["unit_score"]
                
            final_results.sort(key=lambda x: x["score"], reverse=True)
            
            return_results = []
            for doc in final_results:
                # Ensure datetime objects are converted to string
                created_at = doc.get("created_at")
                updated_at = doc.get("updated_at")

                return_results.append({
                    "_id": str(doc["_id"]), 
                    "name": doc["name"],
                    "price": doc.get("price"),
                    "unit": doc.get("unit"),
                    "store_name": doc.get("store_name"),
                    "category": doc.get("category"),
                    "img_url": doc.get("img_url"),
                    "created_at": created_at.isoformat() if created_at else None,
                    "updated_at": updated_at.isoformat() if updated_at else None,
                    "score": doc["score"],
                    "vs_score": doc["vs_score"],
                    "fts_score": doc["fts_score"],
                    "unit_score": doc["unit_score"]
                })
            
            return return_results[:top_k]

        except Exception as e:
            print(f"Error searching products: {e}")
            # traceback.print_exc()  # Add this to get the full stack trace
            return []

    def search_products(self, embeddings: np.ndarray, product_items_with_units: List[tuple], top_k: int = 10) -> List[List[Dict[str, Any]]]:
        try:
            results = []
            for i, (embedding, item_tuple) in enumerate(zip(embeddings, product_items_with_units)):
                product_name, unit = item_tuple                
                search_results = self.search(
                    query_vector=embedding.tolist(),
                    product_name=product_name, 
                    unit=unit,
                    top_k=top_k
                )
                
                results.append(search_results)
            return results
        except Exception as e:
            print(f"Error searching products: {e}")
            return []
    
    def re_indexing(self) -> bool:
        try:
            all_products = self.get_all_products()
            for product in tqdm(all_products, total=len(all_products), desc="Re-indexing products"):
                product = product.to_dict()
                # print(product)
                vector = self.ai_service.get_embeddings(product["unit"] + " " + product["name"])
                product["vector"] = vector.tolist()
                product["updated_at"] = datetime.now()
                self.collection.update_one(
                    {"_id": product["_id"]},
                    {"$set": {
                        "vector": product["vector"],
                        "updated_at": product["updated_at"]
                    }}
                )
            return True
        except Exception as e:
            print(f"Error re-indexing products: {e}")
            return False

