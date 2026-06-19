# Architecture Plan — Inventory & Order Management System

This document defines the technical architecture for the Production-Ready Containerized Inventory & Order Management System. It maps the requirements from `Production-Ready_Containerized_Inventory_Order_Management_System.md` to a concrete implementation using **FastAPI**, **React**, **PostgreSQL**, and **SQLAlchemy**.

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP / REST
┌───────────────────────────────▼─────────────────────────────────┐
│              React Frontend (Vite + JavaScript)                 │
│  Dashboard │ Products │ Customers │ Orders                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │ REST API (JSON)
┌───────────────────────────────▼─────────────────────────────────┐
│                    FastAPI Backend                              │
│  Routers → Services → SQLAlchemy ORM → PostgreSQL               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    PostgreSQL Database                          │
│  products │ customers │ orders │ order_items                    │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Choices

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React (JavaScript), Vite | SPA UI |
| HTTP client | Axios | API communication |
| Routing | React Router | Page navigation |
| State | React Context + hooks | Shared state & API state |
| Styling | CSS Modules or Tailwind CSS | Responsive UI |
| Backend | FastAPI | REST API |
| ORM | SQLAlchemy 2.x | Database access |
| Validation | Pydantic v2 | Request/response schemas |
| Migrations | Alembic | Schema versioning |
| Database | PostgreSQL 16 | Persistent storage |
| Containers | Docker + Docker Compose | Local & production packaging |

### 1.3 Repository Structure

```
EtharaAI/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Settings from env vars
│   │   ├── database.py             # Engine, session, Base
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── routers/                # API route handlers
│   │   ├── services/               # Business logic
│   │   └── exceptions.py           # Custom exceptions & handlers
│   ├── alembic/                    # Migrations
│   ├── tests/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                    # Axios client & API functions
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route-level pages
│   │   ├── context/                # App-wide state
│   │   ├── hooks/                  # Custom hooks
│   │   └── utils/                  # Validation helpers
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
├── architecture.md
└── Production-Ready_Containerized_Inventory_Order_Management_System.md
```

---

## 2. Database Design

### 2.1 Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│    customers     │       │     products     │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ full_name        │       │ name             │
│ email (UNIQUE)   │       │ sku (UNIQUE)     │
│ phone            │       │ price            │
│ created_at       │       │ quantity_in_stock│
│ updated_at       │       │ created_at       │
└────────┬─────────┘       │ updated_at       │
         │                 └────────┬─────────┘
         │ 1                        │ 1
         │                          │
         │ N                        │ N
┌────────▼─────────┐       ┌────────▼─────────┐
│      orders      │       │   order_items    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │◄──────│ order_id (FK)    │
│ customer_id (FK) │  1  N │ product_id (FK)  │
│ total_amount     │       │ quantity         │
│ status           │       │ unit_price       │
│ created_at       │       │ line_total       │
│ updated_at       │       │ id (PK)          │
└──────────────────┘       └──────────────────┘
```

### 2.2 Table Definitions

#### `products`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `INTEGER` | PRIMARY KEY, auto-increment | Internal ID |
| `name` | `VARCHAR(255)` | NOT NULL | Product name |
| `sku` | `VARCHAR(100)` | NOT NULL, UNIQUE | SKU/code — unique per business rule |
| `price` | `NUMERIC(10, 2)` | NOT NULL, CHECK (price >= 0) | Unit price |
| `quantity_in_stock` | `INTEGER` | NOT NULL, CHECK (quantity_in_stock >= 0) | Available inventory |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, default `now()` | Audit |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, default `now()` | Audit |

**Indexes:** `idx_products_sku` on `sku`

#### `customers`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `INTEGER` | PRIMARY KEY, auto-increment | Internal ID |
| `full_name` | `VARCHAR(255)` | NOT NULL | Full name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Email — unique per business rule |
| `phone` | `VARCHAR(50)` | NOT NULL | Phone number |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, default `now()` | Audit |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, default `now()` | Audit |

**Indexes:** `idx_customers_email` on `email`

#### `orders`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `INTEGER` | PRIMARY KEY, auto-increment | Internal ID |
| `customer_id` | `INTEGER` | NOT NULL, FK → `customers.id` | Customer reference |
| `total_amount` | `NUMERIC(12, 2)` | NOT NULL, CHECK (total_amount >= 0) | Calculated by backend |
| `status` | `VARCHAR(20)` | NOT NULL, default `'active'` | `active` or `cancelled` |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, default `now()` | Audit |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, default `now()` | Audit |

**Indexes:** `idx_orders_customer_id` on `customer_id`, `idx_orders_created_at` on `created_at`

#### `order_items`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `INTEGER` | PRIMARY KEY, auto-increment | Internal ID |
| `order_id` | `INTEGER` | NOT NULL, FK → `orders.id` ON DELETE CASCADE | Parent order |
| `product_id` | `INTEGER` | NOT NULL, FK → `products.id` | Product reference |
| `quantity` | `INTEGER` | NOT NULL, CHECK (quantity > 0) | Quantity ordered |
| `unit_price` | `NUMERIC(10, 2)` | NOT NULL | Snapshot of price at order time |
| `line_total` | `NUMERIC(12, 2)` | NOT NULL | `unit_price × quantity` |

**Indexes:** `idx_order_items_order_id` on `order_id`, `idx_order_items_product_id` on `product_id`

**Unique constraint:** `(order_id, product_id)` — one line per product per order (simplifies stock deduction)

### 2.3 SQLAlchemy Model Sketch

```python
# models/product.py
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), nullable=False, unique=True, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    quantity_in_stock = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# models/customer.py
class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(50), nullable=False)
    orders = relationship("Order", back_populates="customer")

# models/order.py
class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(20), nullable=False, default="active")
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

# models/order_item.py
class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
```

### 2.4 Migration Strategy

1. Initialize Alembic against the SQLAlchemy `Base.metadata`.
2. Create initial migration: `001_initial_schema` (all four tables + constraints).
3. Run migrations on backend startup in Docker (or via a one-shot init container).
4. Never modify production schema manually — always use Alembic revisions.

### 2.5 Low-Stock Threshold

Dashboard "low stock" is computed at query time:

- Default threshold: `quantity_in_stock <= 10` (configurable via env `LOW_STOCK_THRESHOLD`).
- Query: `SELECT * FROM products WHERE quantity_in_stock <= :threshold ORDER BY quantity_in_stock ASC`.

---

## 3. Backend Architecture (FastAPI)

### 3.1 Layered Design

```
Request
  → Router (HTTP layer, status codes)
    → Service (business rules, transactions)
      → SQLAlchemy Session (CRUD)
        → PostgreSQL
```

| Layer | Responsibility |
|-------|----------------|
| **Router** | Route mapping, dependency injection, HTTP responses |
| **Schema (Pydantic)** | Input validation, output serialization |
| **Service** | Business logic, stock checks, total calculation |
| **Model (SQLAlchemy)** | Table definitions, relationships |
| **Exception handlers** | Map domain errors to HTTP status codes |

### 3.2 API Structure

Base URL: `/api/v1`

#### Products

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `POST` | `/products` | Create product | 201, 400, 409, 422 |
| `GET` | `/products` | List all products | 200 |
| `GET` | `/products/{id}` | Get product by ID | 200, 404 |
| `PUT` | `/products/{id}` | Update product | 200, 400, 404, 409, 422 |
| `DELETE` | `/products/{id}` | Delete product | 204, 404 |

**Request body — `POST /products` / `PUT /products/{id}`:**

```json
{
  "name": "Wireless Mouse",
  "sku": "WM-001",
  "price": 29.99,
  "quantity_in_stock": 100
}
```

**Response — `ProductResponse`:**

```json
{
  "id": 1,
  "name": "Wireless Mouse",
  "sku": "WM-001",
  "price": 29.99,
  "quantity_in_stock": 100,
  "created_at": "2026-06-19T10:00:00Z",
  "updated_at": "2026-06-19T10:00:00Z"
}
```

#### Customers

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `POST` | `/customers` | Create customer | 201, 400, 409, 422 |
| `GET` | `/customers` | List all customers | 200 |
| `GET` | `/customers/{id}` | Get customer by ID | 200, 404 |
| `DELETE` | `/customers/{id}` | Delete customer | 204, 404 |

**Request body — `POST /customers`:**

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1-555-0100"
}
```

#### Orders

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `POST` | `/orders` | Create order | 201, 400, 404, 409, 422 |
| `GET` | `/orders` | List all orders | 200 |
| `GET` | `/orders/{id}` | Get order with items | 200, 404 |
| `DELETE` | `/orders/{id}` | Cancel/delete order | 204, 404 |

**Request body — `POST /orders`:**

```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

**Response — `OrderDetailResponse`:**

```json
{
  "id": 10,
  "customer_id": 1,
  "customer_name": "Jane Doe",
  "total_amount": 89.97,
  "status": "active",
  "items": [
    {
      "product_id": 1,
      "product_name": "Wireless Mouse",
      "quantity": 2,
      "unit_price": 29.99,
      "line_total": 59.98
    }
  ],
  "created_at": "2026-06-19T11:00:00Z"
}
```

#### Dashboard (additional endpoint for frontend summary)

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `GET` | `/dashboard/summary` | Aggregated stats | 200 |

**Response:**

```json
{
  "total_products": 42,
  "total_customers": 18,
  "total_orders": 156,
  "low_stock_products": [
    { "id": 5, "name": "USB Cable", "sku": "USB-01", "quantity_in_stock": 3 }
  ]
}
```

#### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service + DB connectivity check |

### 3.3 Pydantic Schemas

```
schemas/
├── product.py      # ProductCreate, ProductUpdate, ProductResponse
├── customer.py     # CustomerCreate, CustomerResponse
├── order.py        # OrderItemCreate, OrderCreate, OrderResponse, OrderDetailResponse
└── dashboard.py    # DashboardSummary
```

**Validation rules (Pydantic + custom validators):**

| Field | Rules |
|-------|-------|
| `name` / `full_name` | Min length 1, max 255 |
| `sku` | Alphanumeric + hyphen, max 100 |
| `email` | Valid email format (EmailStr) |
| `phone` | Min 7, max 50 characters |
| `price` | `>= 0`, max 2 decimal places |
| `quantity_in_stock` | `>= 0` integer |
| `quantity` (order item) | `> 0` integer |
| `customer_id` / `product_id` | Positive integer |

### 3.4 Business Logic (Service Layer)

#### Product Service

| Rule | Implementation |
|------|----------------|
| SKU unique | Check before insert/update; raise `ConflictError` → 409 |
| Quantity non-negative | Pydantic validator + DB CHECK constraint |
| Delete product | Block delete if product referenced in active orders (optional safeguard) |

#### Customer Service

| Rule | Implementation |
|------|----------------|
| Email unique | Check before insert; raise `ConflictError` → 409 |
| Delete customer | Allow delete; orders retain `customer_id` or use soft-reference via FK (orders keep history) |

#### Order Service (critical path)

Order creation runs inside a **single database transaction**:

```
1. Validate customer exists
2. For each item:
   a. Load product (with row-level lock: SELECT ... FOR UPDATE)
   b. If quantity_in_stock < requested quantity → raise InsufficientStockError → 409
3. Calculate line_total = product.price × item.quantity
4. Sum line_totals → order.total_amount
5. Insert order + order_items
6. Decrement product.quantity_in_stock for each item
7. Commit transaction
```

| Rule | Implementation |
|------|----------------|
| Insufficient inventory | Pre-check stock inside transaction; 409 with product name/SKU in error detail |
| Auto stock reduction | Update `products.quantity_in_stock` after order insert |
| Auto total calculation | Backend computes `total_amount`; client value ignored |
| Order delete/cancel | `DELETE /orders/{id}` removes order; optionally restore stock on cancel (recommended: restore stock when order deleted) |

**Stock restoration on order delete:**

```
1. Load order items
2. For each item: increment product.quantity_in_stock by item.quantity
3. Delete order (cascade deletes order_items)
4. Commit
```

### 3.5 Error Handling

| Exception | HTTP Status | Example Message |
|-----------|-------------|-----------------|
| `NotFoundError` | 404 | `"Product with id 99 not found"` |
| `ConflictError` (duplicate SKU/email) | 409 | `"SKU 'WM-001' already exists"` |
| `InsufficientStockError` | 409 | `"Insufficient stock for product 'Wireless Mouse' (available: 1, requested: 2)"` |
| `ValidationError` (Pydantic) | 422 | Field-level error details |
| Unhandled exception | 500 | Generic error message (no stack trace in production) |

**Standard error response shape:**

```json
{
  "detail": "Insufficient stock for product 'Wireless Mouse'",
  "code": "INSUFFICIENT_STOCK"
}
```

### 3.6 Configuration (Environment Variables)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@db:5432/inventory` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173,https://app.vercel.app` |
| `LOW_STOCK_THRESHOLD` | Dashboard low-stock cutoff | `10` |
| `APP_ENV` | `development` or `production` | `production` |
| `LOG_LEVEL` | Logging verbosity | `INFO` |

### 3.7 Backend Dependencies (`requirements.txt`)

```
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.9
alembic>=1.13.0
pydantic>=2.6.0
pydantic-settings>=2.2.0
python-dotenv>=1.0.0
email-validator>=2.1.0
```

### 3.8 Testing Plan (Backend)

| Area | Tests |
|------|-------|
| Products | CRUD, duplicate SKU, negative quantity rejected |
| Customers | CRUD, duplicate email rejected |
| Orders | Happy path, insufficient stock, total calculation, stock decrement |
| Order delete | Stock restoration |
| Dashboard | Correct counts and low-stock filter |

Use `pytest` + `httpx.AsyncClient` with a test PostgreSQL database or SQLite (for unit tests only).

---

## 4. Frontend Architecture (React)

### 4.1 Application Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Summary stats + low-stock alert |
| `/products` | ProductsPage | Product list + add/edit/delete |
| `/customers` | CustomersPage | Customer list + add/delete |
| `/orders` | OrdersPage | Order list |
| `/orders/:id` | OrderDetailPage | Single order with line items |

### 4.2 Component Structure

```
src/
├── api/
│   ├── client.js           # Axios instance (base URL from env)
│   ├── products.js         # product API calls
│   ├── customers.js        # customer API calls
│   ├── orders.js           # order API calls
│   └── dashboard.js        # dashboard API calls
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Layout.jsx
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Alert.jsx         # Success/error messages
│   │   ├── LoadingSpinner.jsx
│   │   └── ConfirmDialog.jsx
│   ├── products/
│   │   ├── ProductList.jsx
│   │   ├── ProductForm.jsx
│   │   └── ProductRow.jsx
│   ├── customers/
│   │   ├── CustomerList.jsx
│   │   ├── CustomerForm.jsx
│   │   └── CustomerRow.jsx
│   ├── orders/
│   │   ├── OrderList.jsx
│   │   ├── OrderForm.jsx       # Multi-product order builder
│   │   ├── OrderItemRow.jsx
│   │   └── OrderDetail.jsx
│   └── dashboard/
│       ├── StatCard.jsx
│       └── LowStockList.jsx
├── pages/
│   ├── DashboardPage.jsx
│   ├── ProductsPage.jsx
│   ├── CustomersPage.jsx
│   ├── OrdersPage.jsx
│   └── OrderDetailPage.jsx
├── context/
│   └── AppContext.jsx          # Global alerts, optional cached data
├── hooks/
│   ├── useProducts.js
│   ├── useCustomers.js
│   ├── useOrders.js
│   └── useDashboard.js
├── utils/
│   └── validation.js           # Client-side form validation
├── App.jsx
└── main.jsx
```

### 4.3 State Management

| Approach | Usage |
|----------|-------|
| **Custom hooks** (`useProducts`, etc.) | Fetch, mutate, and expose loading/error/data per domain |
| **React Context** (`AppContext`) | Global toast/alert messages, theme (optional) |
| **Local component state** | Form inputs, modal open/close, edit mode |

No Redux required — Context + hooks is sufficient for this scope.

### 4.4 API Client Configuration

```javascript
// api/client.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // e.g. http://localhost:8000/api/v1
  headers: { 'Content-Type': 'application/json' },
});
```

**Frontend environment variable:**

| Variable | Description | Local | Deployed |
|----------|-------------|-------|----------|
| `VITE_API_BASE_URL` | Backend API base | `http://localhost:8000/api/v1` | `https://api.example.com/api/v1` |

### 4.5 Page Feature Mapping

#### Dashboard (`/`)

- Fetch `GET /dashboard/summary` on load.
- Display four stat cards: total products, customers, orders.
- Show low-stock products table with name, SKU, quantity.
- Highlight rows where quantity ≤ threshold.

#### Products (`/products`)

- Table: name, SKU, price, quantity, actions (edit, delete).
- "Add Product" opens modal with `ProductForm`.
- Edit pre-fills form; submits `PUT /products/{id}`.
- Delete shows `ConfirmDialog`; calls `DELETE /products/{id}`.
- Client validation: required fields, price ≥ 0, quantity ≥ 0.

#### Customers (`/customers`)

- Table: full name, email, phone, actions (delete).
- "Add Customer" modal with `CustomerForm`.
- Client validation: valid email format, required fields.
- Delete with confirmation.

#### Orders (`/orders`)

- Table: order ID, customer name, total, status, date, link to detail.
- "Create Order" opens `OrderForm`:
  - Customer dropdown (from `GET /customers`).
  - Dynamic line items: product dropdown + quantity input.
  - Add/remove line items.
  - Submit `POST /orders`.
- Display API errors (e.g., insufficient stock) in alert banner.

#### Order Detail (`/orders/:id`)

- Fetch `GET /orders/{id}`.
- Show customer info, order items table, total amount, status, timestamps.
- Delete/cancel button with confirmation.

### 4.6 UI/UX Guidelines

| Requirement | Implementation |
|-------------|----------------|
| Responsive | CSS Grid/Flexbox; collapsible sidebar on mobile |
| Clean UI | Consistent spacing, neutral palette, clear typography |
| Form validation | Inline errors on blur/submit; match backend rules |
| Error/success messages | `Alert` component; auto-dismiss after 5s |
| Loading states | Spinner on data fetch and form submit |
| Empty states | Friendly message when lists are empty |

### 4.7 Frontend Dependencies

```
react, react-dom, react-router-dom, axios, vite
```

Optional: `tailwindcss` for rapid responsive styling.

---

## 5. Docker & Infrastructure

### 5.1 Docker Compose Services

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      CORS_ORIGINS: ${CORS_ORIGINS}
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    environment:
      VITE_API_BASE_URL: ${VITE_API_BASE_URL}
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 5.2 Dockerfile Notes

| Service | Base Image | Notes |
|---------|------------|-------|
| Backend | `python:3.12-slim` | Multi-stage optional; run `uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| Frontend | `node:20-alpine` (build) + `nginx:alpine` (serve) | Build React app; serve static files via nginx |
| Database | `postgres:16-alpine` | Named volume for persistence |

### 5.3 `.dockerignore` (both services)

Exclude: `node_modules`, `__pycache__`, `.env`, `.git`, `tests`, `*.md`

---

## 6. Deployment Plan

### 6.1 Target Platforms

| Component | Platform | Notes |
|-----------|----------|-------|
| Backend | **Render** or **Railway** | Docker image from Docker Hub |
| Frontend | **Vercel** or **Netlify** | Static build from `frontend/dist` |
| Database | Render/Railway managed PostgreSQL | Or platform-provided Postgres addon |

### 6.2 Deployment Flow

```
1. Push code to GitHub
2. Build & push backend image to Docker Hub
3. Deploy backend on Render/Railway (pull Docker image, set env vars)
4. Provision managed PostgreSQL; set DATABASE_URL
5. Run Alembic migrations against production DB
6. Deploy frontend on Vercel/Netlify with VITE_API_BASE_URL pointing to live backend
7. Set CORS_ORIGINS on backend to include frontend URL
8. Verify health check, CRUD flows, and order stock logic end-to-end
```

### 6.3 Environment Variables (Production)

| Service | Variables |
|---------|-----------|
| Backend | `DATABASE_URL`, `CORS_ORIGINS`, `LOW_STOCK_THRESHOLD`, `APP_ENV=production` |
| Frontend (build-time) | `VITE_API_BASE_URL` |
| PostgreSQL | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` |

---

## 7. Security Considerations

| Topic | Approach |
|-------|----------|
| Credentials | All secrets via environment variables; never in source code |
| CORS | Restrict to known frontend origins in production |
| Input validation | Pydantic on backend; client validation for UX only |
| SQL injection | SQLAlchemy parameterized queries only |
| HTTPS | Enforced by hosting platforms (Render, Vercel) |

Authentication is not required by the spec; the API is open. Add JWT/session auth in a future iteration if needed.

---

## 8. Implementation & Submission

Phased implementation tasks and submission deliverables are tracked in [`implementation.md`](implementation.md).
