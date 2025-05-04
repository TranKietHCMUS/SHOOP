import redis
import json
from src.config import Config

class RedisService:
    def __init__(self):
        self.client = redis.Redis.from_url(Config.REDIS_URL, decode_responses=True)

    def set(self, key, value, ex=None):
        """set key to value, ex: expire time in seconds (optional)"""
        return self.client.set(key, value, ex=ex)

    def get(self, key):
        """Get value by key"""
        return self.client.get(key)

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
        return self.set(key, json.dumps(obj), ex=ex)

    def get_json(self, key):
        """get object (json) by key"""
        val = self.get(key)
        if val is not None:
            return json.loads(val)
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