# Nautilus — Product Requirements (living document)

**Product**: Nautilus  
**Program**: Savvy Bee Business Capital Market  
**Audience**: Similar institutional capital-markets firms (multi-tenant SaaS posture)  
**Constitution**: [.specify/memory/constitution.md](../.specify/memory/constitution.md)

*Update this file when scope, milestones, or non-negotiables change.*

---

## 1. Background

Industry research (including public materials on **share registration modernization** and
**institutional AI** in financial services) describes a recurring pattern:

- **Shareholder and issuer experience** often lacks unified self-service: investors struggle to see
  holdings and distributions across issuers; issuers lack timely analytics and engagement tools.
- **Operational backends** remain manual, paper-heavy, and poorly integrated with **central
  securities depositories**, **banks**, and **identity** infrastructure—causing delays, errors, and
  **large pools of unclaimed distributions** in some markets.
- **Global comparators** moved toward **digital, mobile-first, 24/7** models; emerging markets show
  dematerialization, virtual meetings, and payment-rail integration. The opportunity is to **leapfrog**
  with modern platforms where regulation allows.

Parallel **group-level AI** narratives describe a shift from **workflow simplification** (first wave)
to **institutional reasoning** (second wave): faster research, risk and compliance monitoring,
portfolio analytics, surveillance, personalization—with **internal tooling first**, then controlled
client-facing use.

Nautilus **does not imply ownership of** any example firm from reference decks; those materials
inform **patterns** only.

## 2. Stated gaps & opportunities

| Gap | Opportunity for Nautilus |
|-----|---------------------------|
| Fragmented shareholder visibility | Unified **dividend/holdings** views and proactive **notifications** |
| Manual verification & branch dependency | **Digital KYC/document** flows with exception queues for staff |
| Weak ops integration | **API-first** integrations (CSD, banking, messaging) per tenant config |
| Issuer reporting & analytics | **Issuer portal**: unclaimed tracking, corporate actions, audit trails |
| Data quality (names, accounts, identity mismatch) | **Entity resolution** + reconciliation tooling (human-approved) |
| AI adoption risk | **Phased AI**: docs/matching/reconciliation **internal** first; guarded client comms |

## 3. Solution themes (convergent)

1. **Hub platform**: Shareholder portal + registrar operations + issuer portal on one **tenant-scoped**
   backbone (see constitution: Registrars as **system-of-record anchor** for register truth).
2. **Education & adoption**: Campaigns and in-product guidance to drive **e-mandates**, record
   updates, and status checks—paired with product features, not instead of them.
3. **Incremental rollout**: Portal and notifications → verification → dividend/ops automation → deep
   compliance and integrations.
4. **Cross-line convergence**: Other lines consume **aggregated or permissioned** insights; no
   ungoverned replication of full registers.

## 4. AI applications (prioritized by risk profile)

| Capability | Phase | Notes |
|------------|-------|--------|
| Document intake (ID, bank, probate) | Early | Extract + classify; **human sign-off** on register impact |
| Entity / name matching | Early–mid | Explainable matching; audit trail |
| Reconciliation copilot | Mid | Suggest matches/exceptions; no auto-payment without rules + approval |
| Internal ops copilot (SOPs, cases) | Early | Lowest external risk; redact PII in prompts by default |
| Regulatory / policy change monitoring (NLP) | Mid | Tenant-specific rule packs |
| Shareholder-facing assistant / “why unpaid” | Late | Templates + **human approval** for outbound |

## 5. Non-goals & constraints

- No implied **endorsement** of reference organizations used in research.
- **No** default training on **shareholder PII** without explicit governance (per constitution).
- **Jurisdiction** and **regulator** behavior are **tenant-configured**, not hard-coded to one country
  unless a release is explicitly scoped that way.

## 6. Success metrics (initial)

- Reduction in **support/contact** volume for routine dividend and record-status queries.
- Increase in **self-service completion** for mandated profile/bank updates (tenant-defined baselines).
- **Audit completeness** for material register and payment-impacting changes (measurable via logs).
- **Time-to-reconcile** for declared distributions (tenant baseline vs after automation).

## 7. Related engineering artifacts

- Speckit **specs** and **plans** must include **Constitution Alignment** and **Constitution Check**
  sections per updated templates under `.specify/templates/`.
- **[Constitution](../.specify/memory/constitution.md) v1.1.0** adds **polyglot service boundaries**
  (e.g. TypeScript portal + Python API) and rules for **third-party website inspiration** (visual
  patterns only; no implied endorsement).
