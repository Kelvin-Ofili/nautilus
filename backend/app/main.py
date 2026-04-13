from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.db import describe_data_backend
from app.routers import distributions, holdings, notices, portal, securities, tenant_config
from app.schemas import ErrorBody, ErrorResponse

app = FastAPI(title=settings.app_name, version="0.1.0")

# Local dev: Allow frontend on Vite dev ports (5173-5180 to cover auto-selection range)
_cors_origins = [
    "http://127.0.0.1:3001",
    "http://localhost:3001",
    "http://[::1]:3001",
]
# Add Vite dev ports 5173-5180
for port in range(5173, 5181):
    _cors_origins.extend([
        f"http://127.0.0.1:{port}",
        f"http://localhost:{port}",
    ])
_cors_origins.append("http://[::1]:5173")
_cors_extra = [o.strip().rstrip('/') 
               for o in settings.cors_extra_origins.split(",") if o.strip()]
_cors_origins.extend(_cors_extra)

print(f"🔒 CORS Configuration:")
print(f"   Local origins: {len(_cors_origins) - len(_cors_extra)}")
print(f"   Extra origins from env: {_cors_extra}")
print(f"   Total allowed origins: {len(_cors_origins)}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
    if isinstance(exc.detail, dict) and "code" in exc.detail and "message" in exc.detail:
        body = ErrorResponse(error=ErrorBody(
            code=str(exc.detail["code"]), message=str(exc.detail["message"])))
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())
    body = ErrorResponse(error=ErrorBody(
        code="http_error", message=str(exc.detail)))
    return JSONResponse(status_code=exc.status_code, content=body.model_dump())


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, _exc: RequestValidationError) -> JSONResponse:
    body = ErrorResponse(error=ErrorBody(
        code="validation_error", message="Invalid request"))
    return JSONResponse(status_code=422, content=body.model_dump())


app.include_router(holdings.router, prefix="/api")
app.include_router(distributions.router, prefix="/api")
app.include_router(tenant_config.router, prefix="/api")
app.include_router(portal.router, prefix="/api")
app.include_router(securities.router, prefix="/api")
app.include_router(notices.router, prefix="/api")


@app.get("/", include_in_schema=False)
async def root() -> dict[str, object]:
    """Browser-friendly entry: JSON map of useful paths (no HTML UI on this service)."""
    return {
        "service": settings.app_name,
        "docs": "/docs",
        "openapi": "/openapi.json",
        "health": "/health",
        "api_examples": {
            "holdings": "GET /api/holdings",
            "distributions": "GET /api/distributions",
            "tenant_config": "GET /api/tenant/config",
            "portal_me": "GET /api/portal/me",
            "portal_summary": "GET /api/portal/summary",
            "portal_activity": "GET /api/portal/activity",
            "securities": "GET /api/securities",
            "security_detail": "GET /api/securities/{id}",
            "notices": "GET /api/notices",
        },
        "dev_headers": "Send X-Dev-Tenant-Slug and X-Dev-User-Sub (see repository README).",
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon() -> Response:
    """Avoid 404 noise when opening the API base URL in a browser."""
    return Response(status_code=204)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "data_backend": describe_data_backend()}


if settings.dev_reseed_memory:

    @app.post("/api/dev/reseed-memory", include_in_schema=False)
    async def dev_reseed_memory() -> dict[str, str]:
        from app.repositories.memory_store import get_store, reset_memory_store

        reset_memory_store()
        get_store()
        return {"status": "reseeded", "data_backend": describe_data_backend()}
