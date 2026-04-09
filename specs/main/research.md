# Research: Shareholder visibility MVP

**Spec**: [spec.md](./spec.md)  
**Date**: 2026-04-08

## 1. Language & runtime

- **Decision**: TypeScript (strict) on **Node.js 22 LTS**.
- **Rationale**: Strong typing for financial/tenant boundaries; large ecosystem for web + PostgreSQL;
  aligns with incremental delivery (single codebase, fast iteration).
- **Alternatives considered**: Python/FastAPI (excellent for APIs, weaker default for unified SSR portal
  without a second frontend stack); Go (fast, but slower UI iteration for early product discovery).

## 2. Application shape

- **Decision**: **Next.js** (App Router) monolith for **portal UI + API routes** in one deployable
  unit for MVP.
- **Rationale**: One vertical slice, one repo layout, built-in routing and server components for
  auth-aware pages; API routes avoid premature microservice split.
- **Alternatives considered**: Separate SPA + FastAPI (more moving parts for MVP); NestJS (heavier
  ceremony before first screen).

## 3. Data store & tenancy enforcement

- **Decision**: **PostgreSQL 16+** with **`tenant_id` on all tenant-owned rows**; enforce isolation in
  the data access layer with integration tests; **evaluate PostgreSQL RLS** in a hardening milestone
  before multi-firm production.
- **Rationale**: Relational model fits holdings/distributions; PostgreSQL is the default for audited,
  transactional workloads; RLS as optional defense-in-depth once policies are stable.
- **Alternatives considered**: DynamoDB-style per-tenant tables (operational overhead early); MySQL
  (acceptable; slightly weaker JSON/policy ergonomics for future rule packs).

## 4. ORM / migrations

- **Decision**: **Prisma** for schema migrations and type-safe queries.
- **Rationale**: Fast schema iteration, clear migration story for a small team.
- **Alternatives considered**: Drizzle (lighter; Prisma chosen for maturity/docs density for MVP).

## 5. Authentication

- **Decision**: **OIDC/OAuth2-ready** session via a pluggable provider (e.g., Auth.js / NextAuth
  pattern) with **tenant claim** embedded in token/session after external login; **dev-only mock
  auth** for local quickstart.
- **Rationale**: Institutions expect IdP integration; mock keeps local velocity without baking in one
  vendor.
- **Alternatives considered**: Custom username/password only (unlikely acceptable for institutional
  tenants long term).

## 6. Testing

- **Decision**: **Vitest** for unit/integration; **Playwright** for thin e2e smoke (login stub +
  holdings page); contract tests against OpenAPI where stable.
- **Rationale**: Default modern JS stack; Playwright catches routing/auth regressions.

## 7. Performance & scale (MVP)

- **Decision**: Target **p95 &lt; 500 ms** for list endpoints at **≤ 1k holdings** per user and **≤ 10k**
  distributions visible; horizontal scale deferred.
- **Rationale**: PRD scope is early portal; numbers anchor SLO conversation without over-engineering.

## 8. Data residency / jurisdiction (was NEEDS CLARIFICATION)

- **Decision**: **No single hosting region encoded in app logic**. All tenant data carries
  `tenant_id`; **residency and regulator packs** are **deployment + configuration** concerns
  (per-tenant metadata for region, future pinning to dedicated DB/cluster). MVP runs in a chosen dev
  region only.
- **Rationale**: Matches constitution (jurisdiction as tenant configuration) and PRD non-goals.
- **Alternatives considered**: Hard-code primary market (rejected; violates constitution).

## 9. Notifications (PRD theme)

- **Decision**: **Out of scope** for implementation in this slice; spec defers. Plan reserves **tenant
  config keys** only.
- **Rationale**: Vertical slice is read-only visibility first (constitution: incremental delivery).
