from fastapi import APIRouter, Depends

from app.deps import PortalContext, get_portal_context
from app.repositories.memory_store import get_store
from app.schemas import NoticeOut, NoticesResponse

router = APIRouter()


@router.get("/notices", response_model=NoticesResponse)
async def list_notices(ctx: PortalContext = Depends(get_portal_context)) -> NoticesResponse:
    store = get_store()
    notes = store.list_notices(ctx.tenant.id)
    store.append_audit(
        tenant_id=ctx.tenant.id,
        actor_portal_user_id=ctx.portal_user.id,
        action="shareholder.notices.list",
        resource_type="notices",
        resource_id=None,
        metadata={"count": len(notes)},
    )
    return NoticesResponse(
        items=[
            NoticeOut(
                id=n.id,
                title=n.title,
                body=n.body,
                published_at=n.published_at,
            )
            for n in notes
        ]
    )
