from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import PortalContext, get_portal_context
from app.repositories.memory_store import get_store
from app.schemas import SecuritiesListResponse, SecurityDetailOut, SecuritySummaryOut

router = APIRouter()


@router.get("/securities", response_model=SecuritiesListResponse)
async def list_securities(ctx: PortalContext = Depends(get_portal_context)) -> SecuritiesListResponse:
    store = get_store()
    secs = store.securities_for_user(ctx.tenant.id, ctx.portal_user.id)
    store.append_audit(
        tenant_id=ctx.tenant.id,
        actor_portal_user_id=ctx.portal_user.id,
        action="shareholder.securities.list",
        resource_type="securities",
        resource_id=None,
        metadata={"count": len(secs)},
    )
    return SecuritiesListResponse(
        items=[
            SecuritySummaryOut(
                id=s.id,
                symbol=s.symbol,
                issuer_name=s.issuer_name,
                isin=s.isin,
                mic=s.mic,
                asset_class=s.asset_class,
            )
            for s in secs
        ]
    )


@router.get("/securities/{security_id}", response_model=SecurityDetailOut)
async def security_detail(
    security_id: UUID,
    ctx: PortalContext = Depends(get_portal_context),
) -> SecurityDetailOut:
    store = get_store()
    s = store.get_security(ctx.tenant.id, security_id)
    if not s:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "not_found", "message": "Security not found"},
        )
    # Ensure user has a position (least-privilege: no browsing full tenant register)
    user_secs = {h.security_id for h in store.list_holdings(ctx.tenant.id, ctx.portal_user.id)}
    if s.id not in user_secs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "not_found", "message": "Security not found"},
        )

    store.append_audit(
        tenant_id=ctx.tenant.id,
        actor_portal_user_id=ctx.portal_user.id,
        action="shareholder.security.detail",
        resource_type="security",
        resource_id=str(s.id),
        metadata={},
    )
    return SecurityDetailOut(
        id=s.id,
        symbol=s.symbol,
        issuer_name=s.issuer_name,
        isin=s.isin,
        mic=s.mic,
        asset_class=s.asset_class,
        description=s.description,
    )
