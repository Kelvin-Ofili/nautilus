from dataclasses import dataclass
from typing import Annotated

from fastapi import Header, HTTPException, status

from app.repositories.memory_store import MemoryStore, PortalUserRow, TenantRow, get_store


@dataclass(frozen=True)
class PortalContext:
    tenant: TenantRow
    portal_user: PortalUserRow


async def get_portal_context(
    x_dev_tenant_slug: Annotated[str | None, Header(alias="X-Dev-Tenant-Slug")] = None,
    x_dev_user_sub: Annotated[str | None, Header(alias="X-Dev-User-Sub")] = None,
) -> PortalContext:
    """
    Development stub: resolve tenant + user from headers. Replace with OIDC/JWT that carries
    tenant_id + subject, validated against the database.
    """
    if not x_dev_tenant_slug or not x_dev_user_sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "unauthorized", "message": "Missing dev auth headers"},
        )

    store: MemoryStore = get_store()
    tenant = store.get_tenant_by_slug(x_dev_tenant_slug.strip().lower())
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "unknown_tenant", "message": "Unknown tenant"},
        )

    user = store.get_portal_user(tenant.id, x_dev_user_sub.strip())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "forbidden", "message": "User not registered for this tenant"},
        )

    return PortalContext(tenant=tenant, portal_user=user)
