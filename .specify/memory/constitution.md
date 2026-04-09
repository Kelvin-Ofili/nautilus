<!--
Sync Impact Report
Version: 1.0.0 → 1.1.0
Modified principles: N/A
Added sections: Engineering Posture: Polyglot & Service Boundaries; Domain bullet on third-party UX inspiration
Removed sections: None
Templates: ✅ .specify/templates/plan-template.md | ✅ .specify/templates/spec-template.md | ✅ .specify/templates/tasks-template.md
Commands: ✅ .cursor/commands/speckit.constitution.md (path note: templates/commands → .cursor/commands)
Runtime docs: ✅ README.md | ✅ docs/PRD.md (product context; keep aligned with this constitution)
Deferred: TODO(RATIFICATION_STAKEHOLDER): Record formal approver name/role when org assigns governance owner
-->

# Nautilus Constitution

## Core Principles

### I. Multi-Tenant by Design

Nautilus MUST treat **tenant isolation** as a first-class requirement: each deploying firm (and
their environments) MUST have logically separated data, configuration, branding, and integration
credentials unless a documented shared-tenant model is explicitly approved.

- New features MUST NOT leak data across tenants (queries, caches, logs, exports, AI prompts,
  background jobs).
- Jurisdiction-specific rules (e.g. market, regulator, tax, identity schemes) MUST be modeled as
  **configurable policy** or tenant-scoped modules, not hard-coded single-client assumptions.
- **Rationale**: The product is intended for **multiple similar capital-markets firms**, not a
  single proprietary deployment; isolation and configurability are the commercial baseline.

### II. Financial Record Integrity & Auditability

Where Nautilus holds or processes **register-of-members**, **dividend**, **corporate action**, or
**payments-adjacent** data, the system MUST preserve **immutable or append-only audit trails** for
material changes, with actor, timestamp, and before/after or equivalent traceability unless
regulation explicitly permits otherwise.

- Reconciliations, bulk uploads, and payment instructions MUST be traceable to source batches and
  approvals.
- **Rationale**: Capital-markets registrars and adjacent lines operate under **high trust and
  regulatory scrutiny**; weak auditability is unacceptable operational risk.

### III. AI Governance: Internal-First, Human Oversight, Privacy

AI and ML features MUST follow this order: **(1)** internal tooling and operator assistance,
**(2)** client/issuer-facing assistance with guardrails, **(3)** any automated outbound or
customer-impacting communication only with **human approval workflows** where content could affect
rights, payments, or legal outcomes.

- Training or fine-tuning on **tenant shareholder PII** MUST NOT occur without explicit written
  governance, lawful basis, and data-processing agreements; default posture is **no such training**.
- Model-assisted decisions that affect eligibility, payments, or register entries MUST be
  **explainable at the rule-and-evidence level** to a competent human reviewer (what inputs, what
  confidence, what override path).
- **Rationale**: Aligns with institutional AI adoption patterns (internal multiplier before external
  differentiation) and mitigates **NDPA-class privacy**, model opacity, and conduct risk.

### IV. Six Business Lines & Convergent Architecture

Nautilus serves **Savvy Bee Business Capital Market** across **six business lines**: **Advisory
(investment banking)**, **Investment Management**, **Research**, **Securities**, **Private
Wealth**, and **Registrars**. The **Registrars** domain is the **system-of-record anchor** for
register and shareholder operational truth; other lines consume **aggregated, permissioned, or
anonymized** insights via explicit contracts (APIs, events), not ad-hoc copies of sensitive
registers.

- Cross-line features MUST document **data classification** (public, firm confidential, client,
  shareholder PII) and **least-privilege** access.
- **Rationale**: Delivers a **convergent** platform story without breaking integrity or creating
  ungoverned data sprawl.

### V. Incremental Delivery & Pragmatic Velocity

Delivery MUST favor **vertical slices** (end-to-end thin paths) and **quick wins** that reduce
friction—e.g. unified dividend visibility, notifications, and self-service verification patterns—
before deep automation or full external AI.

- “Vibe coding” and speed are encouraged **only where** they do not violate Principles I–IV; shortcuts
  MUST be tracked as **explicit debt** with a remediation or hardening milestone.
- **Rationale**: Matches proven incremental registrar modernization (portal → operations automation
  → compliance integration) while keeping shipping sustainable.

## Domain & Regulatory Context

Reference materials (e.g. industry slide decks on share registration modernization and institutional
AI) inform **problem patterns**—unclaimed distributions, lack of self-service, manual reconciliation,
integration gaps with **CSD/custody and banking**, and AI use cases across advisory, portfolio,
research, execution, wealth, and registrar workflows. They do **not** confer ownership, endorsement,
or trademark rights: **Savvy Bee does not own those third-party firms**; Nautilus is **independent
software** positioned for **similar institutions** in comparable markets.

- Features MUST avoid implying endorsement by any sample firm used in research.
- **Third-party websites** (e.g. public wealth-management or advisory firm sites) MAY inform
  **visual hierarchy, accessibility, and trust-oriented copy patterns** for shareholder or issuer
  portals. They MUST NOT be copied in a way that implies **endorsement, partnership, or
  affiliation** with those firms, and tenant **branding and disclosures** remain **tenant-owned
  configuration**.
- Regulatory obligations are **tenant- and jurisdiction-specific**; the codebase MUST support
  configuration and policy variation rather than a single-country hard code unless scoped as such
  in the specification.

## Engineering Posture: Polyglot & Service Boundaries

Shareholder and issuer **presentation layers** MAY be implemented in runtimes **separate** from core
HTTP APIs (for example, a **TypeScript** web client with a **Python** service) when **all** of the
following hold:

- **Tenant isolation** and **least-privilege** rules are enforced **server-side** on every data
  access; the browser is never trusted as the sole authority for tenant or identity.
- **Audit** obligations for the same user journeys are met **without gaps** across process
  boundaries (what is logged, by which component, MUST be specified where split).
- **Cross-origin**, **CORS**, **transport security**, and **service-to-service** trust boundaries
  are **documented** per deployment; undeclared shortcuts MUST NOT become hidden cross-tenant trust
  paths.
- **Data classification** (Principle IV) is preserved at APIs and at the edge (no accidental
  exposure of register extracts through verbose errors or debug payloads).

**Rationale**: Institutional teams often split UI and API skills; this posture allows pragmatic
delivery while keeping the same non-negotiables as a single-runtime monolith.

## Specifications, Plans, and Traceability

All substantive work MUST be traceable through Speckit artifacts: feature **specifications**,
**implementation plans** (including the **Constitution Check** gate), and **task lists** where the
workflow applies. The living product document **[docs/PRD.md](docs/PRD.md)** MUST be updated when
scope, milestones, or non-negotiables change so engineers and stakeholders share one narrative.

- Plans MUST record any **constitution violation** or **principled exception** in a **Complexity
  Tracking** (or equivalent) section with justification and rollback.
- **Rationale**: Keeps “move fast” compatible with **governed** multi-tenant financial software.

## Governance

This constitution supersedes conflicting informal practices for the Nautilus repository and Speckit
workflow until amended.

- **Amendments**: Proposed changes MUST be submitted as a single commit (or PR) touching
  `.specify/memory/constitution.md` and any dependent templates/docs; include an updated **Sync
  Impact Report** comment and semver bump.
- **Versioning**: **MAJOR** — removal or incompatible redefinition of a principle; **MINOR** — new
  principle/section or materially expanded obligation; **PATCH** — clarification or non-semantic
  wording.
- **Compliance review**: Before each release milestone, maintainers MUST confirm Constitution Check
  gates were satisfied for active specs/plans and that tenant isolation and audit requirements were
  not regressed.
- **Runtime guidance**: Use **[docs/PRD.md](docs/PRD.md)** for product scope and priorities; use
  **[README.md](README.md)** for repository entry points.

**Version**: 1.1.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-09
