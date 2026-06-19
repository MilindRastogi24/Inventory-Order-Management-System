from sqlalchemy import select
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    def list_products(self, db: Session) -> list[Product]:
        return list(db.scalars(select(Product).order_by(Product.id)).all())

    def get_product(self, db: Session, product_id: int) -> Product:
        product = db.get(Product, product_id)
        if product is None:
            raise NotFoundError(f"Product with id {product_id} not found", code="NOT_FOUND")
        return product

    def create_product(self, db: Session, data: ProductCreate) -> Product:
        if self._sku_exists(db, data.sku):
            raise ConflictError(f"SKU '{data.sku}' already exists", code="DUPLICATE_SKU")

        product = Product(
            name=data.name,
            sku=data.sku,
            price=data.price,
            quantity_in_stock=data.quantity_in_stock,
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    def update_product(self, db: Session, product_id: int, data: ProductUpdate) -> Product:
        product = self.get_product(db, product_id)

        if data.sku != product.sku and self._sku_exists(db, data.sku):
            raise ConflictError(f"SKU '{data.sku}' already exists", code="DUPLICATE_SKU")

        product.name = data.name
        product.sku = data.sku
        product.price = data.price
        product.quantity_in_stock = data.quantity_in_stock

        db.commit()
        db.refresh(product)
        return product

    def delete_product(self, db: Session, product_id: int) -> None:
        product = self.get_product(db, product_id)

        referenced = db.scalar(
            select(OrderItem.id).where(OrderItem.product_id == product_id).limit(1)
        )
        if referenced is not None:
            raise ConflictError(
                f"Product '{product.name}' cannot be deleted because it is referenced in orders",
                code="PRODUCT_IN_USE",
            )

        db.delete(product)
        db.commit()

    def _sku_exists(self, db: Session, sku: str) -> bool:
        existing = db.scalar(select(Product.id).where(Product.sku == sku).limit(1))
        return existing is not None


product_service = ProductService()
