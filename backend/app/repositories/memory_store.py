"""
In-memory data store mimicking PostgreSQL-shaped rows. Swap for async SQLAlchemy + Postgres later.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from app.schemas import DistributionStatus


@dataclass
class TenantRow:
    id: UUID
    slug: str
    name: str
    config: dict[str, Any]


@dataclass
class PortalUserRow:
    id: UUID
    tenant_id: UUID
    external_sub: str
    display_name: str | None
    shareholder_ref: str


@dataclass
class SecurityRow:
    id: UUID
    tenant_id: UUID
    symbol: str
    issuer_name: str
    mic: str = "XNAS"
    asset_class: str = "Equity"
    isin: str | None = None
    description: str | None = None


@dataclass
class HoldingRow:
    id: UUID
    tenant_id: UUID
    portal_user_id: UUID
    security_id: UUID
    quantity: Decimal
    as_of_date: date


@dataclass
class DistributionRow:
    id: UUID
    tenant_id: UUID
    portal_user_id: UUID
    security_id: UUID | None
    amount: Decimal
    currency: str
    status: DistributionStatus
    pay_date: date | None


@dataclass
class AuditEventRow:
    id: UUID
    tenant_id: UUID
    actor_portal_user_id: UUID | None
    action: str
    resource_type: str
    resource_id: str | None
    metadata: dict[str, Any]
    created_at: datetime


@dataclass
class NoticeRow:
    id: UUID
    tenant_id: UUID
    title: str
    body: str
    published_at: datetime


@dataclass
class MemoryStore:
    tenants: dict[UUID, TenantRow] = field(default_factory=dict)
    tenants_by_slug: dict[str, UUID] = field(default_factory=dict)
    portal_users: dict[UUID, PortalUserRow] = field(default_factory=dict)
    portal_users_by_tenant_sub: dict[tuple[UUID, str], UUID] = field(
        default_factory=dict)
    securities: dict[UUID, SecurityRow] = field(default_factory=dict)
    holdings: list[HoldingRow] = field(default_factory=list)
    distributions: list[DistributionRow] = field(default_factory=list)
    audit_events: list[AuditEventRow] = field(default_factory=list)
    notices: list[NoticeRow] = field(default_factory=list)

    def get_tenant_by_slug(self, slug: str) -> TenantRow | None:
        tid = self.tenants_by_slug.get(slug)
        if not tid:
            return None
        return self.tenants.get(tid)

    def get_portal_user(self, tenant_id: UUID, external_sub: str) -> PortalUserRow | None:
        uid = self.portal_users_by_tenant_sub.get((tenant_id, external_sub))
        if not uid:
            return None
        u = self.portal_users.get(uid)
        if not u or u.tenant_id != tenant_id:
            return None
        return u

    def list_holdings(self, tenant_id: UUID, portal_user_id: UUID) -> list[HoldingRow]:
        return [h for h in self.holdings if h.tenant_id == tenant_id and h.portal_user_id == portal_user_id]

    def list_distributions(self, tenant_id: UUID, portal_user_id: UUID) -> list[DistributionRow]:
        return [
            d
            for d in self.distributions
            if d.tenant_id == tenant_id and d.portal_user_id == portal_user_id
        ]

    def list_notices(self, tenant_id: UUID) -> list[NoticeRow]:
        return sorted(
            [n for n in self.notices if n.tenant_id == tenant_id],
            key=lambda n: n.published_at,
            reverse=True,
        )

    def get_security(self, tenant_id: UUID, security_id: UUID) -> SecurityRow | None:
        s = self.securities.get(security_id)
        if not s or s.tenant_id != tenant_id:
            return None
        return s

    def securities_for_user(self, tenant_id: UUID, portal_user_id: UUID) -> list[SecurityRow]:
        sec_ids = {h.security_id for h in self.list_holdings(
            tenant_id, portal_user_id)}
        out: list[SecurityRow] = []
        for sid in sec_ids:
            s = self.get_security(tenant_id, sid)
            if s:
                out.append(s)
        return sorted(out, key=lambda x: x.symbol)

    def append_audit(
        self,
        *,
        tenant_id: UUID,
        actor_portal_user_id: UUID | None,
        action: str,
        resource_type: str,
        resource_id: str | None,
        metadata: dict[str, Any] | None = None,
    ) -> AuditEventRow:
        row = AuditEventRow(
            id=uuid4(),
            tenant_id=tenant_id,
            actor_portal_user_id=actor_portal_user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata=metadata or {},
            created_at=datetime.now(timezone.utc),
        )
        self.audit_events.append(row)
        return row

    def recent_activity_for_user(
        self, tenant_id: UUID, portal_user_id: UUID, limit: int = 15
    ) -> list[AuditEventRow]:
        rows = [
            e
            for e in self.audit_events
            if e.tenant_id == tenant_id and e.actor_portal_user_id == portal_user_id
        ]
        rows.sort(key=lambda e: e.created_at, reverse=True)
        return rows[:limit]


def _seed() -> MemoryStore:
    store = MemoryStore()

    t_alpha = TenantRow(
        id=uuid4(),
        slug="alpha",
        name="SavvyBee Ltd",
        config={
            "displayCurrency": "USD",
            "locale": "en-US",
            "tagline": "Clarity for shareholders. Integrity in every register.",
            "supportEmail": "shareholder.services@savvybee.example",
            "supportPhone": "+2347052640276",
            "addressLine": "10, Victor Bamiro Street, Alapere, Lagos, Nigeria",
            "regulatoryNote": "Information is provided for convenience only and does not constitute "
            "investment, tax, or legal advice. Confirm material matters with your professional "
            "advisers. SavvyBee demo data — not affiliated with any external brand.",
        },
    )
    t_beta = TenantRow(
        id=uuid4(),
        slug="beta",
        name="Registrar Beta PLC",
        config={
            "displayCurrency": "NGN",
            "locale": "en-NG",
            "tagline": "Trusted registrar services across emerging markets.",
            "supportEmail": "registrar@beta-registrar.example",
            "supportPhone": "+234 800 000 0000",
            "addressLine": "15 Marina Road, Lagos",
            "regulatoryNote": "Tenant-configured disclosure text. Demo environment only.",
        },
    )
    store.tenants[t_alpha.id] = t_alpha
    store.tenants[t_beta.id] = t_beta
    store.tenants_by_slug[t_alpha.slug] = t_alpha.id
    store.tenants_by_slug[t_beta.slug] = t_beta.id

    u_alice = PortalUserRow(
        id=uuid4(),
        tenant_id=t_alpha.id,
        external_sub="alice",
        display_name="Alice A.",
        shareholder_ref="shr-alpha-alice",
    )
    u_bob = PortalUserRow(
        id=uuid4(),
        tenant_id=t_beta.id,
        external_sub="bob",
        display_name="Bob B.",
        shareholder_ref="shr-beta-bob",
    )
    store.portal_users[u_alice.id] = u_alice
    store.portal_users[u_bob.id] = u_bob
    store.portal_users_by_tenant_sub[(
        t_alpha.id, u_alice.external_sub)] = u_alice.id
    store.portal_users_by_tenant_sub[(
        t_beta.id, u_bob.external_sub)] = u_bob.id

    s_alpha_1 = SecurityRow(
        id=uuid4(),
        tenant_id=t_alpha.id,
        symbol="ACME",
        issuer_name="ACME Corporation",
        mic="XNAS",
        asset_class="Common equity",
        isin="US0001234567",
        description="Large-cap industrial conglomerate (illustrative).",
    )
    s_alpha_2 = SecurityRow(
        id=uuid4(),
        tenant_id=t_alpha.id,
        symbol="LONG",
        issuer_name="Longbridge Financial Group",
        mic="XNYS",
        asset_class="Depositary receipt",
        isin="US0007654321",
        description="Diversified financial services holding company (illustrative).",
    )
    s_beta_1 = SecurityRow(
        id=uuid4(),
        tenant_id=t_beta.id,
        symbol="GLOB",
        issuer_name="Globex Industries PLC",
        mic="XLOS",
        asset_class="Common equity",
        isin="NG0000000001",
        description="Listed industrial issuer (illustrative).",
    )
    store.securities[s_alpha_1.id] = s_alpha_1
    store.securities[s_alpha_2.id] = s_alpha_2
    store.securities[s_beta_1.id] = s_beta_1

    store.holdings.append(
        HoldingRow(
            id=uuid4(),
            tenant_id=t_alpha.id,
            portal_user_id=u_alice.id,
            security_id=s_alpha_1.id,
            quantity=Decimal("1000.00000000"),
            as_of_date=date(2026, 3, 31),
        )
    )
    store.holdings.append(
        HoldingRow(
            id=uuid4(),
            tenant_id=t_alpha.id,
            portal_user_id=u_alice.id,
            security_id=s_alpha_2.id,
            quantity=Decimal("250.00000000"),
            as_of_date=date(2026, 3, 31),
        )
    )
    store.holdings.append(
        HoldingRow(
            id=uuid4(),
            tenant_id=t_beta.id,
            portal_user_id=u_bob.id,
            security_id=s_beta_1.id,
            quantity=Decimal("50.00000000"),
            as_of_date=date(2026, 3, 31),
        )
    )

    store.distributions.append(
        DistributionRow(
            id=uuid4(),
            tenant_id=t_alpha.id,
            portal_user_id=u_alice.id,
            security_id=s_alpha_1.id,
            amount=Decimal("125.50"),
            currency="USD",
            status=DistributionStatus.paid,
            pay_date=date(2026, 2, 15),
        )
    )
    store.distributions.append(
        DistributionRow(
            id=uuid4(),
            tenant_id=t_alpha.id,
            portal_user_id=u_alice.id,
            security_id=s_alpha_2.id,
            amount=Decimal("42.00"),
            currency="USD",
            status=DistributionStatus.paid,
            pay_date=date(2026, 1, 10),
        )
    )
    store.distributions.append(
        DistributionRow(
            id=uuid4(),
            tenant_id=t_alpha.id,
            portal_user_id=u_alice.id,
            security_id=s_alpha_1.id,
            amount=Decimal("18.25"),
            currency="USD",
            status=DistributionStatus.unclaimed,
            pay_date=None,
        )
    )
    store.distributions.append(
        DistributionRow(
            id=uuid4(),
            tenant_id=t_beta.id,
            portal_user_id=u_bob.id,
            security_id=s_beta_1.id,
            amount=Decimal("9000.00"),
            currency="NGN",
            status=DistributionStatus.paid,
            pay_date=date(2026, 2, 20),
        )
    )

    now = datetime.now(timezone.utc)
    store.notices.extend(
        [
            NoticeRow(
                id=uuid4(),
                tenant_id=t_alpha.id,
                title="e-Dividend mandate reminder",
                body="Completing your e-mandate helps ensure timely distribution credits. "
                "Contact shareholder services if you need assistance updating bank details.",
                published_at=now,
            ),
            NoticeRow(
                id=uuid4(),
                tenant_id=t_alpha.id,
                title="Annual general meeting materials",
                body="AGM notices will be distributed in accordance with issuer timelines. "
                "This portal reflects registrar records only.",
                published_at=datetime(2026, 3, 1, 12, 0, tzinfo=timezone.utc),
            ),
            NoticeRow(
                id=uuid4(),
                tenant_id=t_beta.id,
                title="Registrar holiday hours",
                body="Our shareholder desk observes local public holidays. Urgent matters may be "
                "queued for the next business day.",
                published_at=datetime(2026, 2, 14, 9, 0, tzinfo=timezone.utc),
            ),
        ]
    )

    return store


_STORE: MemoryStore | None = None


def get_store() -> MemoryStore:
    global _STORE
    if _STORE is None:
        _STORE = _seed()
    return _STORE


def reset_memory_store() -> None:
    """Clear singleton so the next get_store() runs _seed() again (local dev only)."""
    global _STORE
    _STORE = None
