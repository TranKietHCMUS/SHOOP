from datetime import datetime
from typing import List, Dict, Optional
from bson.objectid import ObjectId

class Users:
    def __init__(
        self,
        username: str,
        password: str,
        fullName: str,
        dateOfBirth: datetime,
        gender: str,
        history: Optional[List[Dict]] = None,
        id: str = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self._id = ObjectId(id) if id else None
        self.username = username
        self.password = password
        self.fullName = fullName
        self.dateOfBirth = dateOfBirth
        self.gender = gender
        self.history = history or []
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    def to_dict(self) -> Dict:
        result = {
            "username": self.username.strip(),
            "password": self.password,
            "fullName": self.fullName,
            "dateOfBirth": self.dateOfBirth,
            "gender": self.gender,
            "history": self.history,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        if self._id:
            result["_id"] = self._id
        return result