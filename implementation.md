# Implementation Plan — Inventory & Order Management System

This document tracks the phased implementation and submission deliverables for the Inventory & Order Management System. Technical architecture details live in [`architecture.md`](architecture.md).

---

## 1. Implementation Phases

### Phase 1 — Foundation
- [x] Project scaffolding (backend + frontend folders)
- [x] Docker Compose with PostgreSQL
- [x] SQLAlchemy models + Alembic initial migration
- [x] FastAPI app with health check and CORS

### Phase 2 — Core APIs
- [x] Product CRUD with validation and unique SKU
- [x] Customer CRUD with unique email
- [x] Order create with stock check, total calculation, stock deduction
- [x] Order list, detail, delete with stock restoration
- [x] Dashboard summary endpoint

### Phase 3 — Frontend
- [x] Layout, routing, API client
- [x] Products page (full CRUD)
- [x] Customers page (add, list, delete)
- [x] Orders page (create, list, detail, delete)
- [x] Dashboard with stats and low-stock list

### Phase 4 — Polish & Deploy
- [ ] Error handling and user feedback on frontend
- [ ] Responsive styling pass
- [ ] Backend tests (pytest)
- [ ] Production Dockerfiles
- [ ] Push backend image to Docker Hub
- [ ] Deploy backend + frontend to free hosting
- [ ] End-to-end verification on live URLs

---

## 2. Submission Checklist

| Deliverable | Source |
|-------------|--------|
| GitHub repository | `EtharaAI` repo with `backend/` and `frontend/` |
| Docker Hub backend image | `docker push <username>/inventory-api:latest` |
| Live frontend URL | Vercel/Netlify deployment |
| Live backend API URL | Render/Railway deployment (`/health`, `/docs`) |

FastAPI auto-generates OpenAPI docs at `/docs` — useful for API verification and submission demo.
