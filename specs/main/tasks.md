---
description: "Task list for Shareholder visibility MVP (read-only) — architecture pivot"
---

# Tasks: Shareholder visibility MVP (read-only)

**Architecture (current)**: TypeScript **Next.js** in **`frontend/`**; **FastAPI** + in-memory store in
`backend/`. Constitution **v1.1.0** allows this split (Polyglot & Service Boundaries).

## Phase A: Repository layout & backend API

- [X] T-A01 Create `backend/` FastAPI app with CORS for local portal in `backend/app/main.py`
- [X] T-A02 Add in-memory store + seed data in `backend/app/repositories/memory_store.py`
- [X] T-A03 Implement dev auth headers dependency in `backend/app/deps.py`
- [X] T-A04 Expose core `GET /api/*` routes under `backend/app/routers/`
- [X] T-A05 Add Postgres placeholder module in `backend/app/db.py` and `DATABASE_URL` in `backend/.env.example`
- [X] T-A06 Add pytest tenant-isolation coverage in `backend/tests/test_isolation.py`

## Phase B: TypeScript portal (mocks + live API)

- [X] T-B01 Add typed API client with mock toggle in `frontend/src/lib/api/client.ts` and `frontend/src/lib/api/mock-data.ts`
- [X] T-B02 Build holdings and distributions pages in `frontend/src/app/`
- [X] T-B03 Wire navigation and institutional shell in `frontend/src/components/PortalShell.tsx`
- [X] T-B04 Document env vars in `frontend/.env.example`

## Phase C: Docs & hygiene

- [X] T-C01 Root `.gitignore` for Node + Python in `.gitignore`
- [X] T-C02 Update root `README.md` with run instructions
- [X] T-C03 Refresh `specs/main/quickstart.md` for FastAPI + Next.js + mocks

## Phase D: Rich portal UI + expanded API (2026-04-09)

- [X] T-D01 Add dashboard, securities list/detail, notices, portal summary/me/activity endpoints in `backend/`
- [X] T-D02 Extend tenant config with branding fields (firm, tagline, contacts, regulatory note)
- [X] T-D03 Redesign `frontend` UI (institutional navy/gold pattern, typography, dashboard cards)
- [X] T-D04 Update constitution to **v1.1.0** (polyglot posture + third-party UX inspiration rule)
- [X] T-D05 Sync `specs/main/spec.md`, `plan.md`, `contracts/README.md`; relocate app path to `frontend/`

**MVP scope**: Read-only shareholder views with tenant isolation, audit on reads, configurable tenant
presentation.
