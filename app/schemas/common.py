from typing import TypeVar, Generic, List, Optional
from pydantic import BaseModel, Field, ConfigDict

T = TypeVar("T")

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(10, ge=1, le=100, description="Items per page")

class PaginatedResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True)
    
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int
