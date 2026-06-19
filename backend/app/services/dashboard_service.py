from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.dashboard import DashboardSummary, LowStockProduct


class DashboardService:
    def get_summary(self, db: Session) -> DashboardSummary:
        settings = get_settings()

        total_products = db.scalar(select(func.count()).select_from(Product)) or 0
        total_customers = db.scalar(select(func.count()).select_from(Customer)) or 0
        total_orders = db.scalar(select(func.count()).select_from(Order)) or 0

        low_stock_products = db.scalars(
            select(Product)
            .where(Product.quantity_in_stock <= settings.low_stock_threshold)
            .order_by(Product.quantity_in_stock.asc())
        ).all()

        return DashboardSummary(
            total_products=total_products,
            total_customers=total_customers,
            total_orders=total_orders,
            low_stock_products=[
                LowStockProduct(
                    id=product.id,
                    name=product.name,
                    sku=product.sku,
                    quantity_in_stock=product.quantity_in_stock,
                )
                for product in low_stock_products
            ],
        )


dashboard_service = DashboardService()
