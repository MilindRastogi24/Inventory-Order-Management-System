from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.exceptions import InsufficientStockError, NotFoundError
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order import (
    OrderCreate,
    OrderDetailResponse,
    OrderItemResponse,
    OrderSummaryResponse,
)


class OrderService:
    def create_order(self, db: Session, data: OrderCreate) -> OrderDetailResponse:
        customer = db.get(Customer, data.customer_id)
        if customer is None:
            raise NotFoundError(f"Customer with id {data.customer_id} not found", code="NOT_FOUND")

        product_ids = [item.product_id for item in data.items]

        try:
            products: dict[int, Product] = {}
            for product_id in product_ids:
                product = db.execute(
                    select(Product).where(Product.id == product_id).with_for_update()
                ).scalar_one_or_none()
                if product is None:
                    raise NotFoundError(f"Product with id {product_id} not found", code="NOT_FOUND")
                products[product_id] = product

            total_amount = Decimal("0.00")
            order = Order(customer_id=data.customer_id, total_amount=0, status="active")
            db.add(order)
            db.flush()

            for item in data.items:
                product = products[item.product_id]
                if product.quantity_in_stock < item.quantity:
                    raise InsufficientStockError(
                        (
                            f"Insufficient stock for product '{product.name}' "
                            f"(available: {product.quantity_in_stock}, requested: {item.quantity})"
                        ),
                        code="INSUFFICIENT_STOCK",
                    )

                unit_price = Decimal(str(product.price))
                line_total = unit_price * item.quantity
                total_amount += line_total

                db.add(
                    OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        quantity=item.quantity,
                        unit_price=unit_price,
                        line_total=line_total,
                    )
                )
                product.quantity_in_stock -= item.quantity

            order.total_amount = total_amount
            db.commit()
        except (NotFoundError, InsufficientStockError):
            db.rollback()
            raise

        order = self._get_order_with_details(db, order.id)
        return self._to_detail_response(order)

    def list_orders(self, db: Session) -> list[OrderSummaryResponse]:
        orders = db.execute(
            select(Order)
            .options(selectinload(Order.customer))
            .order_by(Order.created_at.desc())
        ).scalars().all()
        return [self._to_summary_response(order) for order in orders]

    def get_order(self, db: Session, order_id: int) -> OrderDetailResponse:
        order = self._get_order_with_details(db, order_id)
        return self._to_detail_response(order)

    def delete_order(self, db: Session, order_id: int) -> None:
        order = self._get_order_with_details(db, order_id)

        try:
            for item in order.items:
                product = db.execute(
                    select(Product).where(Product.id == item.product_id).with_for_update()
                ).scalar_one()
                product.quantity_in_stock += item.quantity

            db.delete(order)
            db.commit()
        except NotFoundError:
            db.rollback()
            raise

    def _get_order_with_details(self, db: Session, order_id: int) -> Order:
        order = db.execute(
            select(Order)
            .options(
                selectinload(Order.customer),
                selectinload(Order.items).selectinload(OrderItem.product),
            )
            .where(Order.id == order_id)
        ).scalar_one_or_none()
        if order is None:
            raise NotFoundError(f"Order with id {order_id} not found", code="NOT_FOUND")
        return order

    def _to_summary_response(self, order: Order) -> OrderSummaryResponse:
        return OrderSummaryResponse(
            id=order.id,
            customer_id=order.customer_id,
            customer_name=order.customer.full_name,
            total_amount=order.total_amount,
            status=order.status,
            created_at=order.created_at,
        )

    def _to_detail_response(self, order: Order) -> OrderDetailResponse:
        return OrderDetailResponse(
            id=order.id,
            customer_id=order.customer_id,
            customer_name=order.customer.full_name,
            total_amount=order.total_amount,
            status=order.status,
            created_at=order.created_at,
            items=[
                OrderItemResponse(
                    product_id=item.product_id,
                    product_name=item.product.name,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    line_total=item.line_total,
                )
                for item in order.items
            ],
        )


order_service = OrderService()
