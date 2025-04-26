from typing import Dict, List, Tuple
from pydantic import BaseModel, Field


class StoreModel(BaseModel):
    coord: Tuple[float, float] = Field(
        ..., description="(lat, lon) of the store"
    )
    items: Dict[int, float] = Field(
        ..., description="mapping item_id -> price"
    )


class SearchRequestModel(BaseModel):
    stores: Dict[str, StoreModel]
    groups: List[List[int]] = Field(
        ..., min_items=1,
        description="list of groups of interchangeable item IDs"
    )
    user_loc: Tuple[float, float] = Field(
        ..., description="(lat, lon) of the user start location"
    )
