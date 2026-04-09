# Feature Specification: Shareholder visibility MVP (read-only)

**Feature Branch**: `main`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: Derived from [README.md](../../README.md) product requirements (incremental rollout: portal first).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View holdings and distributions (Priority: P1)

An authenticated shareholder (or their representative) opens the tenant-branded portal and sees a
read-only list of their positions and past distributions for that registrar tenant.

**Why this priority**: Directly addresses fragmented visibility and supports reduced routine support
contact (PRD §2, §6).

**Independent Test**: Seed one tenant with synthetic holdings; log in as a test user; verify lists
match seed data and never show another tenant’s rows.

**Acceptance Scenarios**:

1. **Given** a shareholder with positions in tenant A, **When** they open the holdings view,
   **Then** they see only their positions for tenant A with issuer/security identifiers and quantity.
2. **Given** historical distributions for that shareholder, **When** they open distributions,
   **Then** they see amount, currency, status, and pay date fields appropriate to the tenant policy.
3. **Given** a user authenticated to tenant A, **When** they attempt to access a resource scoped to
   tenant B (e.g., forged URL), **Then** access is denied and no tenant B data is returned.

---

### User Story 2 — Audit trail for shareholder read access (Priority: P2)

Operators can demonstrate who viewed which shareholder-visible records, for compliance and dispute
handling.

**Why this priority**: Constitution requires auditability for material processing; read access to
PII-heavy views should be traceable without slowing P1.

**Independent Test**: Perform a holdings view; confirm an append-only audit entry records actor,
tenant, coarse action, target resource type, and timestamp.

**Acceptance Scenarios**:

1. **Given** a successful holdings page load, **When** the request completes, **Then** an audit event
   is persisted with tenant id, subject id, action `shareholder.holdings.view`, and timestamp.

---

### User Story 3 — Tenant policy placeholder for jurisdiction (Priority: P3)

The UI/API respects tenant-configurable labels and date/number formatting hooks even when underlying
rules are stubbed.

**Why this priority**: PRD and constitution require jurisdiction as configuration, not hard-coded
country behavior.

**Independent Test**: Switch tenant config fixture (locale/currency display); verify presentation
changes without code change.

**Acceptance Scenarios**:

1. **Given** tenant display policy specifies currency `NGN`, **When** distributions are shown,
   **Then** amounts render with the configured currency symbol/code.

---

### User Story 4 — Dashboard, securities context, and notices (Priority: P2)

A shareholder opens a **dashboard** with portfolio summary (counts, YTD paid totals in display
currency where applicable), browses **issuer/security** detail only for positions they hold, and
reads **tenant notices** (e.g. e-mandate reminders). Presentation follows **institutional,
trust-oriented** patterns; visual inspiration from public capital-markets sites MUST NOT imply
endorsement (per constitution Domain section).

**Why this priority**: Reduces “where do I look?” friction and mirrors how wealth/registrar portals
commonly structure information—without expanding scope to payments or mutable register actions.

**Independent Test**: Summary counts match seeded holdings/distributions; security detail for a
foreign tenant’s id returns **not found**; notices differ per tenant seed.

**Acceptance Scenarios**:

1. **Given** a seeded user with two positions, **When** they open the dashboard, **Then** they see
   holdings count, distribution count, and distinct securities count consistent with seed data.
2. **Given** a security the user holds, **When** they open its detail view, **Then** they see ISIN/MIC
   class fields and descriptive copy suitable for a read-only registrar projection.
3. **Given** tenant A and tenant B each have notices, **When** the user is bound to tenant A,
   **Then** they never see tenant B notice titles or bodies.

---

### Edge Cases

- Missing or zero holdings: show empty state, not an error.
- Partial outages (DB unavailable): fail closed with generic error; no cross-tenant fallback paths.
- Session expired mid-navigation: redirect to auth; no data cached in client beyond policy.

## Requirements *(mandatory)*

### Constitution Alignment *(mandatory)*

- **Polyglot boundary**: TypeScript portal + Python API is allowed under constitution v1.1.0
  **Engineering Posture: Polyglot & Service Boundaries**; all tenant checks and audit writes occur on
  the API for data mutations/reads.
- **Tenancy**: Every query and cache key is scoped by `tenant_id`; integration stubs are per-tenant
  config only.
- **Audit**: Append-only audit log for shareholder-visible reads (P2) and for any later
  register-impacting mutations (out of scope for this spec but reserved in schema).
- **AI**: N/A for this slice; no LLM or training on PII.
- **Data classification**: Shareholder PII (holdings/distributions); no replication to other business
  lines beyond explicit future APIs; registrar remains SoR for positions—this portal is a
  **projection** of registrar truth.
- **Delivery slice**: Read-only portal + audit; KYC, payments, notifications delivery, and AI
  deferred.

### Functional Requirements

- **FR-001**: System MUST authenticate users and bind each session to exactly one registrar tenant
  context for portal routes.
- **FR-002**: System MUST provide a read-only holdings API and UI backed by tenant-scoped data.
- **FR-003**: System MUST provide a read-only distributions API and UI backed by tenant-scoped data.
- **FR-004**: System MUST deny cross-tenant access at the application layer (tests MUST include
  negative cases).
- **FR-005**: System MUST persist audit records for configured shareholder read actions (P2).
- **FR-006**: System MUST load display/jurisdiction presentation settings from tenant configuration
  (stub acceptable; no single-country hard-coded business rules).

### Key Entities

- **Tenant**: Deploying registrar firm; branding and policy configuration.
- **PortalUser**: Authenticated identity mapped to a shareholder or representative within a tenant.
- **Holding**: Position row (quantity, security/issuer reference) for a user within a tenant.
- **Distribution**: Historical payment record visible to the shareholder within a tenant.
- **AuditEvent**: Append-only record of security-relevant actions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of holdings/distributions API integration tests pass with tenant isolation
  assertions.
- **SC-002**: Demo path: new developer follows `quickstart.md` and sees seeded holdings in under 30
  minutes (local).
- **SC-003**: Audit query returns at least one event per acceptance scenario in User Story 2 in
  test environment.

## Assumptions

- Registrar back-office SoR integration is simulated or batch-loaded for MVP; no live CSD in v1.
- Authentication is delegated (e.g., OIDC-ready) or stubbed in dev with production-shaped tenant
  claims.
- Mobile-responsive web is in scope; native apps are out of scope.

## Multi-Tenancy & Jurisdiction *(mandatory if feature stores or displays firm or client data)*

- **Tenants affected**: All deploying registrar tenants; data partitioned by `tenant_id`.
- **Per-tenant configuration**: Branding, display locale/currency, feature flags for future modules.
- **Data residency / jurisdiction**: NEEDS CLARIFICATION for production hosting region; design MUST
  keep tenant partition keys to enforce residency when policy is set.

## AI & Automation *(mandatory if feature uses ML, LLM, or automated decisions)*

- **Surface**: N/A (no AI in this slice).
- **Human oversight**: N/A.
- **PII & training**: No model training on shareholder PII; no LLM calls.
- **Explainability**: N/A.
