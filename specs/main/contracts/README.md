# API contracts: Shareholder visibility MVP

Implemented by **FastAPI** under `backend/app/` (JSON field names are **snake_case**). OpenAPI lives
at `/openapi.json` when the server is running.

## Conventions

- **Base path**: `/api`
- **Auth (dev stub)**: Headers `X-Dev-Tenant-Slug` and `X-Dev-User-Sub` (production: replace with
  validated OIDC/JWT + server-side tenant binding).
- **Errors**: JSON `{ "error": { "code": string, "message": string } }` for handled failures.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/holdings` | Positions for current user (includes ISIN, MIC, asset class) |
| GET | `/api/distributions` | Distributions for current user |
| GET | `/api/tenant/config` | Tenant branding, locale, currency, support contacts, regulatory note |
| GET | `/api/portal/me` | Current portal user + tenant identifiers |
| GET | `/api/portal/summary` | Dashboard aggregates (counts, YTD paid in display currency) |
| GET | `/api/portal/activity` | Recent audited actions for current user (`limit` query 1–50) |
| GET | `/api/securities` | Distinct securities the user holds |
| GET | `/api/securities/{id}` | Security detail (404 if not held or wrong tenant) |
| GET | `/api/notices` | Tenant-scoped shareholder notices |

## Versioning

- Unversioned `/api/*` for MVP. Introduce `/api/v1` before external integrators depend on shapes.
