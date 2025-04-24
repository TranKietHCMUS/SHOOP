from datetime import datetime
from typing import List, Dict, Optional

class Users:
    def __init__(
        self,
        username: str,
        password: str,
        fullname: str,
        age: int,
        gender: str,
        history: Optional[List[Dict]] = None,
        id: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.__id = id
        self.__username = username
        self.__password = password
        self.__fullname = fullname
        self.__age = age
        self.__gender = gender
        self.__history = history or []
        self.__created_at = created_at
        self.__updated_at = updated_at

    # Getters
    @property
    def id(self) -> Optional[str]:
        return self.__id

    @property
    def username(self) -> str:
        return self.__username

    @property
    def password(self) -> str:
        return self.__password

    @property
    def fullname(self) -> str:
        return self.__fullname

    @property
    def age(self) -> int:
        return self.__age

    @property
    def gender(self) -> str:
        return self.__gender

    @property
    def history(self) -> List[Dict]:
        return self.__history

    @property
    def created_at(self) -> Optional[datetime]:
        return self.__created_at

    @property
    def updated_at(self) -> Optional[datetime]:
        return self.__updated_at

    # Setters
    @id.setter
    def id(self, value: Optional[str]):
        self.__id = value

    @username.setter
    def username(self, value: str):
        self.__username = value

    @password.setter
    def password(self, value: str):
        self.__password = value

    @fullname.setter
    def fullname(self, value: str):
        self.__fullname = value

    @age.setter
    def age(self, value: int):
        self.__age = value

    @gender.setter
    def gender(self, value: str):
        self.__gender = value

    @history.setter
    def history(self, value: List[Dict]):
        self.__history = value

    @created_at.setter
    def created_at(self, value: Optional[datetime]):
        self.__created_at = value

    @updated_at.setter
    def updated_at(self, value: Optional[datetime]):
        self.__updated_at = value

    def to_dict(self) -> Dict:
        return {
            "_id": self.__id,
            "username": self.__username,
            "password": self.__password,
            "fullname": self.__fullname,
            "age": self.__age,
            "gender": self.__gender,
            "history": self.__history,
            "created_at": self.__created_at,
            "updated_at": self.__updated_at
        }