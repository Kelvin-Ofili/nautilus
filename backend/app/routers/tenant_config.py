from fastapi import APIRouter, Depends

from app.deps import PortalContext, get_portal_context
from app.repositories.memory_store import TenantRow
from app.schemas import TenantPortalConfig

router = APIRouter()


def tenant_portal_config(tenant: TenantRow) -> TenantPortalConfig:
    cfg = tenant.config or {}
    return TenantPortalConfig(
        display_currency=str(cfg.get("displayCurrency", "USD")),
        locale=str(cfg.get("locale", "en-US")),
        firm_legal_name=tenant.name,
        tagline=str(cfg.get("tagline", "")),
        support_email=str(cfg.get("supportEmail", "")),
        support_phone=str(cfg.get("supportPhone", "")),
        address_line=str(cfg.get("addressLine", "")),
        regulatory_note=str(cfg.get("regulatoryNote", "")),
    )


@router.get("/tenant/config", response_model=TenantPortalConfig)
async def tenant_portal_configuration(ctx: PortalContext = Depends(get_portal_context)) -> TenantPortalConfig:
    return tenant_portal_config(ctx.tenant)
