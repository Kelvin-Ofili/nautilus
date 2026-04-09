# Data model: Shareholder visibility MVP

**Spec**: [spec.md](./spec.md)

## Entities

### Tenant

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | Primary key |
| slug | string | Unique; used in host or path routing where applicable |
| name | string | Display |
| config | JSON | Display locale, currency code, feature flags (stub) |
| created_at | timestamptz | Audit |

### PortalUser

Represents a login subject able to access shareholder views for one tenant.

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | Primary key |
| tenant_id | UUID | FK → Tenant; **hard scope** for all portal queries |
| external_sub | string | IdP subject identifier (unique per tenant) |
| display_name | string | Optional; PII—minimize logging |
| shareholder_ref | string | Opaque link to SoR shareholder key (not necessarily PII) |
| created_at | timestamptz | |

**Constraints**: Unique (`tenant_id`, `external_sub`).

### Security (instrument reference)

Abstract listing line for a registered security within a tenant (not full instrument master).

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | Primary key |
| tenant_id | UUID | FK → Tenant |
| symbol | string | Tenant-scoped code or ISIN placeholder |
| issuer_name | string | Display |
| created_at | timestamptz | |

### Holding

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | Primary key |
| tenant_id | UUID | FK → Tenant; duplicate for defense-in-depth filters |
| portal_user_id | UUID | FK → PortalUser |
| security_id | UUID | FK → Security |
| quantity | decimal(28,8) | Scale per tenant policy later |
| as_of_date | date | Snapshot semantics for MVP |

**Constraints**: Queries MUST always filter `tenant_id` = session tenant.

### Distribution

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | Primary key |
| tenant_id | UUID | FK → Tenant |
| portal_user_id | UUID | FK → PortalUser |
| security_id | UUID | FK → Security (nullable if cash-only event) |
| amount | decimal(28,8) | |
| currency | char(3) | ISO 4217 |
| status | enum | e.g. `declared`, `paid`, `unclaimed` (tenant labels via config) |
| pay_date | date | Nullable until paid |

### AuditEvent (append-only)

| Field | Type | Notes |
|-------|------|--------|
| id | UUID | Primary key |
| tenant_id | UUID | FK → Tenant |
| actor_portal_user_id | UUID | Nullable for system jobs |
| action | string | e.g. `shareholder.holdings.view` |
| resource_type | string | e.g. `holdings`, `distributions` |
| resource_id | string | Nullable coarse id |
| metadata | JSON | Redacted; no full response payloads by default |
| created_at | timestamptz | Server-generated |

**Rules**: No updates/deletes in application code; retention policy TBD per tenant governance.

## Relationships (text)

- Tenant 1—* PortalUser; Tenant 1—* Security; Tenant 1—* Holding; Tenant 1—* Distribution; Tenant 1—*
  AuditEvent.
- PortalUser 1—* Holding; PortalUser 1—* Distribution.

## Validation (MVP)

- All writes (seed/admin only in MVP) set `tenant_id` consistently with parent references.
- API handlers reject mismatched `tenant_id` between session and row.

## State transitions

- **Distribution.status**: Managed by future ops automation; MVP may seed static rows only.
