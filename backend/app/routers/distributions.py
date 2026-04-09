from fastapi import APIRouter, Depends

from app.deps import PortalContext, get_portal_context
from app.repositories.memory_store import get_store
from app.schemas import DistributionOut, DistributionsResponse

router = APIRouter()


@router.get("/distributions", response_model=DistributionsResponse)
async def list_distributions(ctx: PortalContext = Depends(get_portal_context)) -> DistributionsResponse:
    store = get_store()
    rows = store.list_distributions(ctx.tenant.id, ctx.portal_user.id)
    items: list[DistributionOut] = []
    for d in rows:
        items.append(
            DistributionOut(
                id=d.id,
                security_id=d.security_id,
                amount=str(d.amount),
                currency=d.currency,
                status=d.status,
                pay_date=d.pay_date,
            )
        )

    store.append_audit(
        tenant_id=ctx.tenant.id,
        actor_portal_user_id=ctx.portal_user.id,
        action="shareholder.distributions.view",
        resource_type="distributions",
        resource_id=None,
        metadata={"count": len(items)},
    )

    return DistributionsResponse(items=items)
