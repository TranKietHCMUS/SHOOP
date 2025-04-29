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


class StoreSearchRequestModel(BaseModel):
    lat: float = Field(..., description="Latitude of the center point")
    lng: float = Field(..., description="Longitude of the center point")
    radius: float = Field(..., gt=0, description="Radius in kilometers")


class NearbySearchRequestModel(BaseModel):
    prompt: str = Field(..., description="User input prompt describing requested products")
    lat: float = Field(..., description="Latitude of the center point")
    lng: float = Field(..., description="Longitude of the center point")
    radius: float = Field(..., gt=0, description="Radius in kilometers")
