from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class DistributionStatus(str, Enum):
    declared = "declared"
    paid = "paid"
    unclaimed = "unclaimed"


class HoldingOut(BaseModel):
    id: UUID
    security_id: UUID
    issuer_name: str
    symbol: str
    quantity: str = Field(description="Decimal as string")
    as_of_date: date
    isin: str | None = None
    mic: str | None = None
    asset_class: str | None = None


class DistributionOut(BaseModel):
    id: UUID
    security_id: UUID | None
    amount: str
    currency: str = Field(min_length=3, max_length=3)
    status: DistributionStatus
    pay_date: date | None


class HoldingsResponse(BaseModel):
    items: list[HoldingOut]


class DistributionsResponse(BaseModel):
    items: list[DistributionOut]


class TenantPortalConfig(BaseModel):
    """Tenant-facing branding and display policy (configurable per registrar)."""

    display_currency: str
    locale: str
    firm_legal_name: str
    tagline: str
    support_email: str
    support_phone: str
    address_line: str
    regulatory_note: str


class PortalMeOut(BaseModel):
    portal_user_id: UUID
    external_sub: str
    display_name: str | None
    shareholder_ref: str
    tenant_slug: str
    tenant_name: str


class PortalSummaryOut(BaseModel):
    holdings_count: int
    distributions_count: int
    distinct_securities_count: int
    ytd_paid_total_display_currency: str
    last_distribution_pay_date: date | None
    as_of: date


class ActivityItemOut(BaseModel):
    action: str
    resource_type: str
    created_at: datetime


class PortalActivityResponse(BaseModel):
    items: list[ActivityItemOut]


class SecuritySummaryOut(BaseModel):
    id: UUID
    symbol: str
    issuer_name: str
    isin: str | None
    mic: str | None
    asset_class: str | None


class SecuritiesListResponse(BaseModel):
    items: list[SecuritySummaryOut]


class SecurityDetailOut(BaseModel):
    id: UUID
    symbol: str
    issuer_name: str
    isin: str | None
    mic: str | None
    asset_class: str | None
    description: str | None


class NoticeOut(BaseModel):
    id: UUID
    title: str
    body: str
    published_at: datetime


class NoticesResponse(BaseModel):
    items: list[NoticeOut]


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorBody
