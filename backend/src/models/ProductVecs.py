from bson.objectid import ObjectId
from datetime import datetime
from pymongo.operations import SearchIndexModel
import numpy as np
from src.config import Config
import os

class ProductVecs:
    def __init__(self, db):
        self.collection = db.get_collection("product_vecs")
        self._ensure_indexes()

    def _ensure_indexes(self):
        try:
            self.collection.create_index([("name", 1)], unique=True, name="name_unique_index")

            # Semantic search index
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
                name="product_vecs_index",
                type="vectorSearch"
            )

            # Full-text search index
            text_index_model = SearchIndexModel(
                definition={
                    "mappings": {
                        "dynamic": False,
                        "fields": {
                            "name": {
                                "type": "string"
                            }
                        }
                    }
                },
                name="product_text_index",
                type="search"
            )

            self.collection.create_search_index(model=vector_index_model)
            self.collection.create_search_index(model=text_index_model)

            print("Indexes created successfully")

        except Exception as e:
                print(f"Error creating indexes: {e}")

    def _validate_product(self, product: dict) -> dict:
        if "name" not in product or "vector" not in product:
            raise ValueError("Wrong product format")
            
        if not isinstance(product["name"], str):
            raise ValueError("Name must be a string")
        product["name"] = product["name"].strip()
        
        if not isinstance(product["vector"], list):
            raise ValueError("Vector must be a list")
        if not all(isinstance(x, (int, float)) for x in product["vector"]):
            raise ValueError("Vector must contain only numbers")
            
        vector = np.array(product["vector"], dtype=np.float32)
        norm = np.linalg.norm(vector)
        if norm == 0:
            raise ValueError("Vector must not contain only zeros")
        product["vector"] = (vector / norm).tolist()
        
        now = datetime.now()
        if "_id" not in product:
            product["created_at"] = now
        product["updated_at"] = now
        
        return product

    def insert_one(self, product: dict) -> ObjectId:
        try:
            product = self._validate_product(product)
            
            if self.collection.find_one({"name": product["name"]}):
                raise ValueError(f"Product '{product['name']}' already exists")
            
            result = self.collection.insert_one(product)
            return result.inserted_id
        except Exception as e:
            print(f"Error adding product: {e}")
            raise e

    def insert_many(self, products: list[dict]) -> list[ObjectId]:
        try:
            validated_products = []
            for product in products:
                try:
                    validated_product = self._validate_product(product)
                    if not self.collection.find_one({"name": validated_product["name"]}):
                        validated_products.append(validated_product)
                    else:
                        print(f"Skipping product '{product['name']}' (already exists)")
                except Exception as e:
                    print(f"Skipping invalid product: {e}")
                    continue
            
            if validated_products:
                result = self.collection.insert_many(validated_products)
                return result.inserted_ids
            return []
        except Exception as e:
            print(f"Error adding products: {e}")
            raise e

    def find_by_id(self, id: str) -> dict:
        try:
            return self.collection.find_one({"_id": ObjectId(id)})
        except Exception as e:
            print(f"Error finding product: {e}")
            return None

    def find_by_name(self, name: str) -> dict:
        try:
            return self.collection.find_one({"name": name})
        except Exception as e:
            print(f"Error finding product: {e}")
            return None

    def find_all(self, skip: int = 0, limit: int = 100) -> list[dict]:
        try:
            cursor = self.collection.find().skip(skip).limit(limit)
            return list(cursor)
        except Exception as e:
            print(f"Error fetching product list: {e}")
            return []

    def update_by_id(self, id: str, update_data: dict) -> bool:
        try:
            current = self.find_by_id(id)
            if not current:
                raise ValueError(f"Not found product with id {id}")

            updated = {**current, **update_data}
            
            validated = self._validate_product(updated)
            
            if validated["name"] != current["name"]:
                existing = self.collection.find_one({
                    "name": validated["name"],
                    "_id": {"$ne": ObjectId(id)}
                })
                if existing:
                    raise ValueError(f"Product '{validated['name']}' already exists")

            result = self.collection.update_one(
                {"_id": ObjectId(id)},
                {"$set": validated}
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

    def search(self, query_vector: list[float], product_name: str = None, top_k: int = 5) -> list[dict]:
        try:
            # Normalize vector
            vector = np.array(query_vector, dtype=np.float32)
            norm = np.linalg.norm(vector)
            if norm == 0:
                raise ValueError("Query vector must not contain only zeros")
            query_vector = (vector / norm).tolist()

            results = {}

            # Vector search pipeline
            vector_pipeline = [
                {
                    "$vectorSearch": {
                        "index": "product_vecs_index",
                        "path": "vector",
                        "queryVector": query_vector, 
                        "numCandidates": 100,
                        "limit": 20
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "name": 1,
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
                    "created_at": doc.get("created_at"),
                    "updated_at": doc.get("updated_at"),
                    "vs_score": doc["vs_score"] * Config.VECTOR_WEIGHT,
                    "fts_score": 0
                }

            # Text search if product name is provided
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
                            "created_at": 1,
                            "updated_at": 1,
                            "fts_score": {"$meta": "searchScore"}
                        }
                    },
                    {"$limit": 20}
                ]
                
                text_results = list(self.collection.aggregate(text_pipeline))
                
                # Process text results
                for doc in text_results:
                    doc_id = str(doc["_id"])
                    if doc_id in results:
                        results[doc_id]["fts_score"] = doc["fts_score"] * Config.FULL_TEXT_WEIGHT
                    else:
                        results[doc_id] = {
                            "_id": doc["_id"],
                            "name": doc["name"],
                            "created_at": doc.get("created_at"),
                            "updated_at": doc.get("updated_at"),
                            "vs_score": 0,
                            "fts_score": doc["fts_score"] * Config.FULL_TEXT_WEIGHT
                        }

            final_results = list(results.values())
            for doc in final_results:
                doc["score"] = doc["vs_score"] + doc["fts_score"]
            
            final_results.sort(key=lambda x: x["score"], reverse=True)
            return final_results[:top_k]

        except Exception as e:
            print(f"Error searching: {e}")
            return []
