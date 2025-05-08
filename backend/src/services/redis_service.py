import redis
import json
from src.config import Config

class RedisService:
    def __init__(self):
        self.client = redis.Redis.from_url(Config.REDIS_URL, decode_responses=True)
        print("RedisService initialized")

    def set(self, key, value, ex=None):
        """set key to value, ex: expire time in seconds (optional)"""
        print(f"RedisService.set: Attempting to set key='{key}'. Value type: {type(value)}. Expiry: {ex}")
        try:
            result = self.client.set(key, value, ex=ex)
            print(f"RedisService.set: Successfully set key='{key}'. Result: {result}")
            return result
        except Exception as e:
            print(f"RedisService.set: Error setting key='{key}': {e}")
            raise

    def get(self, key):
        """Get value by key"""
        print(f"RedisService.get: Attempting to get key='{key}'")
        try:
            value = self.client.get(key)
            print(f"RedisService.get: Key='{key}', Retrieved value type: {type(value)}. Value: '{str(value)[:100]}...'") # Log snippet of value
            return value
        except Exception as e:
            print(f"RedisService.get: Error getting key='{key}': {e}")
            raise

    def delete(self, key):
        """Delete key"""
        return self.client.delete(key)

    def exists(self, key):
        """Check if key exists"""
        return self.client.exists(key)

    def keys(self, pattern='*'):
        """Get all keys by pattern"""
        return self.client.keys(pattern)

    def set_json(self, key, obj, ex=None):
        """Save object python as json"""
        print(f"RedisService.set_json: Attempting to set JSON for key='{key}'. Object type: {type(obj)}. Expiry: {ex}")
        try:
            json_value = json.dumps(obj)
            print(f"RedisService.set_json: Successfully serialized object for key='{key}'. JSON value snippet: '{json_value[:100]}...'")
            return self.set(key, json_value, ex=ex)
        except TypeError as te:
            print(f"RedisService.set_json: TypeError during JSON serialization for key='{key}': {te}. Object causing error: {obj}")
            raise # Re-raise to be caught by service layer if needed
        except Exception as e:
            print(f"RedisService.set_json: General error for key='{key}': {e}")
            raise

    def get_json(self, key):
        """get object (json) by key"""
        print(f"RedisService.get_json: Attempting to get JSON for key='{key}'")
        val = self.get(key)
        if val is not None:
            try:
                deserialized_obj = json.loads(val)
                print(f"RedisService.get_json: Successfully deserialized JSON for key='{key}'")
                return deserialized_obj
            except json.JSONDecodeError as jde:
                print(f"RedisService.get_json: JSONDecodeError for key='{key}': {jde}. Raw value: '{val[:100]}...'")
                return None # Or handle error as appropriate
            except Exception as e:
                print(f"RedisService.get_json: Error deserializing JSON for key='{key}': {e}")
                raise
        print(f"RedisService.get_json: No value found for key='{key}'")
        return None

    def lpush_json(self, key, obj, max_len=5):
        """Push object vào list Redis, tự động giới hạn độ dài"""
        pipe = self.client.pipeline()
        pipe.lpush(key, json.dumps(obj, default=str))
        pipe.ltrim(key, 0, max_len - 1)  # chỉ giữ lại 5 phần tử mới nhất
        pipe.execute()

    def lrange_json(self, key, start=0, end=-1):
        """Trả về list object từ Redis"""
        return [json.loads(item) for item in self.client.lrange(key, start, end)]

    def update_latest_plans(self, key, plans):
        """Cập nhật field 'plans' của phần tử đầu tiên trong danh sách"""
        # Lấy phần tử đầu tiên
        val = self.client.lindex(key, 0)
        if val is None:
            return False
        obj = json.loads(val)
        obj["plans"] = plans
        # Cập nhật lại phần tử đầu tiên
        self.client.lset(key, 0, json.dumps(obj, default=str))
        return True

    def delete_item_by_index(self, key, index):
        """Xoá phần tử tại vị trí index trong list Redis"""
        items = self.client.lrange(key, 0, -1)
        if index < 0 or index >= len(items):
            return False  # Index không hợp lệ

        # Xoá phần tử tại index
        del items[index]

        # Xoá toàn bộ danh sách cũ và ghi đè danh sách mới
        pipe = self.client.pipeline()
        pipe.delete(key)
        for item in reversed(items):  # dùng reversed vì lpush
            pipe.lpush(key, item)
        pipe.execute()
        return True