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
