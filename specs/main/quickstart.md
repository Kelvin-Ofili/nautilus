# Quickstart: Shareholder visibility MVP (local)

**Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js **22** LTS
- Python **3.11+**
- Git
- **PostgreSQL** is optional for this milestone (API uses an in-memory store; `DATABASE_URL` is reserved for the Postgres cutover).

## Steps

1. **Backend** — from repository root (use the **`backend`** folder, not `backend\.venv`):

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Portal** — second terminal:

   ```powershell
   cd frontend
   copy .env.example .env.local
   npm install
   npm run dev
   ```

   In `.env.local`, use either:

   - `NEXT_PUBLIC_USE_MOCK_API=true` (no Python process required), or
   - `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` with `NEXT_PUBLIC_DEV_TENANT_SLUG=alpha` and `NEXT_PUBLIC_DEV_USER_SUB=alice`.

3. Open `http://localhost:3000/` (dashboard) and `http://localhost:3000/holdings` to confirm data.

4. **Tests** (tenant isolation + audit):

   ```powershell
   cd backend
   .\.venv\Scripts\python.exe -m pytest
   ```

## Verify

- Holdings and distributions match seeded users (**alpha/alice**, **beta/bob** in `backend/app/repositories/memory_store.py`).
- `pytest` passes (cross-tenant access denied at the API boundary).

## Constitution reminder

- Do not log full PII payloads; audit events remain coarse and append-only.
