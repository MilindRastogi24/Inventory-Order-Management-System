from sqlalchemy import select
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.customer import CustomerCreate


class CustomerService:
    def list_customers(self, db: Session) -> list[Customer]:
        return list(db.scalars(select(Customer).order_by(Customer.id)).all())

    def get_customer(self, db: Session, customer_id: int) -> Customer:
        customer = db.get(Customer, customer_id)
        if customer is None:
            raise NotFoundError(f"Customer with id {customer_id} not found", code="NOT_FOUND")
        return customer

    def create_customer(self, db: Session, data: CustomerCreate) -> Customer:
        if self._email_exists(db, data.email):
            raise ConflictError(f"Email '{data.email}' already exists", code="DUPLICATE_EMAIL")

        customer = Customer(
            full_name=data.full_name,
            email=data.email,
            phone=data.phone,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    def delete_customer(self, db: Session, customer_id: int) -> None:
        customer = self.get_customer(db, customer_id)

        has_orders = db.scalar(
            select(Order.id).where(Order.customer_id == customer_id).limit(1)
        )
        if has_orders is not None:
            raise ConflictError(
                f"Customer '{customer.full_name}' cannot be deleted because they have orders",
                code="CUSTOMER_HAS_ORDERS",
            )

        db.delete(customer)
        db.commit()

    def _email_exists(self, db: Session, email: str) -> bool:
        existing = db.scalar(select(Customer.id).where(Customer.email == email).limit(1))
        return existing is not None


customer_service = CustomerService()
