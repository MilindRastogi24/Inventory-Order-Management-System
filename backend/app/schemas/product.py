import re
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

SKU_PATTERN = re.compile(r"^[A-Za-z0-9-]+$")


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., ge=0)
    quantity_in_stock: int = Field(..., ge=0)

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, value: str) -> str:
        if not SKU_PATTERN.match(value):
            raise ValueError("SKU must contain only letters, numbers, and hyphens")
        return value

    @field_validator("price")
    @classmethod
    def validate_price_decimals(cls, value: Decimal) -> Decimal:
        if value != value.quantize(Decimal("0.01")):
            raise ValueError("Price must have at most 2 decimal places")
        return value


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    price: Decimal
    quantity_in_stock: int
    created_at: datetime
    updated_at: datetime
