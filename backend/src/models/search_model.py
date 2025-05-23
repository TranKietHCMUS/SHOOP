from typing import Dict, List, Tuple, Any
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


class PlanStoreModel(BaseModel):
    address: str = Field(..., description="Store address")
    lat: float = Field(..., description="Latitude of the store")
    lng: float = Field(..., description="Longitude of the store")
    items: List[Dict[str, Any]] = Field(..., description="List of items with candidates")


class PlanRequestModel(BaseModel):
    stores: List[PlanStoreModel] = Field(..., description="List of stores from /search/nearby")
    user_loc: Tuple[float, float] = Field(..., description="User location")
