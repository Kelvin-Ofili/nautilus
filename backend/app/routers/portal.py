from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, Query

from app.deps import PortalContext, get_portal_context
from app.repositories.memory_store import get_store
from app.routers.tenant_config import tenant_portal_config
from app.schemas import (
    PortalActivityResponse,
    PortalMeOut,
    PortalSummaryOut,
    ActivityItemOut,
)

router = APIRouter()


@router.get("/portal/me", response_model=PortalMeOut)
async def portal_me(ctx: PortalContext = Depends(get_portal_context)) -> PortalMeOut:
    store = get_store()
    store.append_audit(
        tenant_id=ctx.tenant.id,
        actor_portal_user_id=ctx.portal_user.id,
        action="portal.me.view",
        resource_type="profile",
        resource_id=str(ctx.portal_user.id),
        metadata={},
    )
    return PortalMeOut(
        portal_user_id=ctx.portal_user.id,
        external_sub=ctx.portal_user.external_sub,
        display_name=ctx.portal_user.display_name,
        shareholder_ref=ctx.portal_user.shareholder_ref,
        tenant_slug=ctx.tenant.slug,
        tenant_name=ctx.tenant.name,
    )


@router.get("/portal/summary", response_model=PortalSummaryOut)
async def portal_summary(ctx: PortalContext = Depends(get_portal_context)) -> PortalSummaryOut:
    store = get_store()
    holdings = store.list_holdings(ctx.tenant.id, ctx.portal_user.id)
    distributions = store.list_distributions(ctx.tenant.id, ctx.portal_user.id)
    cfg = tenant_portal_config(ctx.tenant)
    display_ccy = cfg.display_currency

    ytd_total = Decimal("0")
    last_pay: date | None = None
    ytd_start = date(datetime.now(timezone.utc).year, 1, 1)
    for d in distributions:
        if d.currency != display_ccy:
            continue
        if d.status.value != "paid":
            continue
        if d.pay_date and d.pay_date >= ytd_start:
            ytd_total += d.amount
        if d.pay_date and (last_pay is None or d.pay_date > last_pay):
            last_pay = d.pay_date

    distinct_sec = len({h.security_id for h in holdings})
    as_of = max((h.as_of_date for h in holdings), default=date.today())

    store.append_audit(
        tenant_id=ctx.tenant.id,
        actor_portal_user_id=ctx.portal_user.id,
        action="portal.summary.view",
        resource_type="dashboard",
        resource_id=None,
        metadata={
            "holdings_count": len(holdings),
            "distributions_count": len(distributions),
        },
    )

    return PortalSummaryOut(
        holdings_count=len(holdings),
        distributions_count=len(distributions),
        distinct_securities_count=distinct_sec,
        ytd_paid_total_display_currency=str(ytd_total),
        last_distribution_pay_date=last_pay,
        as_of=as_of,
    )


@router.get("/portal/activity", response_model=PortalActivityResponse)
async def portal_activity(
    ctx: PortalContext = Depends(get_portal_context),
    limit: int = Query(default=15, ge=1, le=50),
) -> PortalActivityResponse:
    store = get_store()
    rows = store.recent_activity_for_user(ctx.tenant.id, ctx.portal_user.id, limit=limit)
    store.append_audit(
        tenant_id=ctx.tenant.id,
        actor_portal_user_id=ctx.portal_user.id,
        action="portal.activity.view",
        resource_type="audit_feed",
        resource_id=None,
        metadata={"limit": limit},
    )
    return PortalActivityResponse(
        items=[
            ActivityItemOut(
                action=e.action,
                resource_type=e.resource_type,
                created_at=e.created_at,
            )
            for e in rows
        ]
    )
