from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.order import OrderCreate, OrderDetailResponse, OrderSummaryResponse
from app.services.order_service import order_service

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])


@router.get("", response_model=list[OrderSummaryResponse])
def list_orders(db: Session = Depends(get_db)):
    return order_service.list_orders(db)


@router.post("", response_model=OrderDetailResponse, status_code=status.HTTP_201_CREATED)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    return order_service.create_order(db, data)


@router.get("/{order_id}", response_model=OrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return order_service.get_order(db, order_id)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order_service.delete_order(db, order_id)
