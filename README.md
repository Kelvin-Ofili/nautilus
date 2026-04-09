# Nautilus

Capital-markets software initiative for **Savvy Bee Business Capital Market**, spanning six business
lines (Advisory, Investment Management, Research, Securities, Private Wealth, Registrars). Designed
for **multi-firm** deployment—not a single proprietary tenant.

## Governance

- **Constitution** (non-negotiable engineering principles): [.specify/memory/constitution.md](.specify/memory/constitution.md)
- **Product requirements** (duplicate of the section below for editors who prefer `docs/PRD.md`):
  [docs/PRD.md](docs/PRD.md)

## Speckit

Feature work flows through `.cursor/commands/speckit.*` — plans MUST pass the **Constitution Check**
section in `specs/*/plan.md`.

## Development (Shareholder visibility MVP)

Stack: **TypeScript** portal in **`frontend/`** (Next.js) + **Python** API (`backend/`, FastAPI). The API
uses an **in-memory** repository that mirrors PostgreSQL-shaped rows; swap in **SQLAlchemy + asyncpg**
when you connect a real **Postgres** instance (`DATABASE_URL` is reserved in `backend/.env.example`).
The portal can call the API or use **mock fixtures** (`NEXT_PUBLIC_USE_MOCK_API=true`).

### Backend (FastAPI)

Run these from the **`backend`** directory (the folder that contains `app/`), not from inside `.venv`.

If the venv is **not** activated, call modules explicitly:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If the venv **is** activated (`.\.venv\Scripts\Activate.ps1`), this is equivalent:

```powershell
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

(`uvicorn` alone often fails on Windows because `Scripts` is not on `PATH` until activation.)

**Port 8000 fails with WinError 10013** (forbidden socket): another process may own the port, or Windows may exclude it (Hyper-V / WSL). Use e.g. `--port 8001` and set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to match.

**Always start the portal from `frontend/`** (`npm run dev` there). To remove a leftover `apps/portal`
folder when Windows locks `*.node` files, run from the repo root:

`powershell -ExecutionPolicy Bypass -File .\scripts\remove-legacy-apps-portal.ps1 -KillNode`

If that still fails, use **Run as administrator**: same command with **`-TakeOwnership`** appended,
or fully quit Cursor, reboot once, then delete `apps\portal` before reopening the project.

Run tests:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
```

### Portal (Next.js)

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Use `.env.local`: either set `NEXT_PUBLIC_USE_MOCK_API=true` or leave the API URL pointed at
`http://127.0.0.1:8000` with `NEXT_PUBLIC_DEV_TENANT_SLUG=alpha` and `NEXT_PUBLIC_DEV_USER_SUB=alice`.

Seeded dev identities in the in-memory store: **alpha / alice**, **beta / bob** (see
`backend/app/repositories/memory_store.py`).

---

# Nautilus — Product Requirements (living document)

**Product**: Nautilus  
**Program**: Savvy Bee Business Capital Market  
**Audience**: Similar institutional capital-markets firms (multi-tenant SaaS posture)

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
|------------|-------|-------|
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
  sections per templates under `.specify/templates/`.
- **Constitution v1.1.0** (see [.specify/memory/constitution.md](.specify/memory/constitution.md)) adds
  **polyglot service boundaries** and **third-party UX inspiration** rules (patterns only; no implied
  endorsement).
