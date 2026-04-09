from fastapi import APIRouter, Depends

from app.deps import PortalContext, get_portal_context
from app.repositories.memory_store import get_store
from app.schemas import HoldingOut, HoldingsResponse

router = APIRouter()


@router.get("/holdings", response_model=HoldingsResponse)
async def list_holdings(ctx: PortalContext = Depends(get_portal_context)) -> HoldingsResponse:
    store = get_store()
    rows = store.list_holdings(ctx.tenant.id, ctx.portal_user.id)
    items: list[HoldingOut] = []
    for h in rows:
        sec = store.securities.get(h.security_id)
        if not sec or sec.tenant_id != ctx.tenant.id:
            continue
        items.append(
            HoldingOut(
                id=h.id,
                security_id=h.security_id,
                issuer_name=sec.issuer_name,
                symbol=sec.symbol,
                quantity=str(h.quantity),
                as_of_date=h.as_of_date,
                isin=sec.isin,
                mic=sec.mic,
                asset_class=sec.asset_class,
            )
        )

    store.append_audit(
        tenant_id=ctx.tenant.id,
        actor_portal_user_id=ctx.portal_user.id,
        action="shareholder.holdings.view",
        resource_type="holdings",
        resource_id=None,
        metadata={"count": len(items)},
    )

    return HoldingsResponse(items=items)
