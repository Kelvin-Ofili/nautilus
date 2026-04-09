import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def test_holdings_requires_headers(client: TestClient) -> None:
    r = client.get("/api/holdings")
    assert r.status_code == 401


def test_holdings_tenant_scoped(client: TestClient) -> None:
    r = client.get(
        "/api/holdings",
        headers={"X-Dev-Tenant-Slug": "alpha", "X-Dev-User-Sub": "alice"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert len(data["items"]) >= 1
    assert data["items"][0]["symbol"] == "ACME"


def test_holdings_wrong_user_for_tenant_forbidden(client: TestClient) -> None:
    r = client.get(
        "/api/holdings",
        headers={"X-Dev-Tenant-Slug": "alpha", "X-Dev-User-Sub": "bob"},
    )
    assert r.status_code == 403


def test_distributions_other_tenant_data_not_leaked(client: TestClient) -> None:
    r = client.get(
        "/api/distributions",
        headers={"X-Dev-Tenant-Slug": "alpha", "X-Dev-User-Sub": "alice"},
    )
    assert r.status_code == 200
    for row in r.json()["items"]:
        assert row["currency"] == "USD"


def test_audit_written_on_holdings_view(client: TestClient) -> None:
    from app.repositories.memory_store import get_store

    before = len(get_store().audit_events)
    client.get(
        "/api/holdings",
        headers={"X-Dev-Tenant-Slug": "alpha", "X-Dev-User-Sub": "alice"},
    )
    after = get_store().audit_events
    assert len(after) > before
    assert any(e.action == "shareholder.holdings.view" for e in after[-3:])


def test_tenant_config_scoped(client: TestClient) -> None:
    r = client.get(
        "/api/tenant/config",
        headers={"X-Dev-Tenant-Slug": "beta", "X-Dev-User-Sub": "bob"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["display_currency"] == "NGN"
    assert "Registrar Beta" in body["firm_legal_name"]


def test_portal_summary_alpha(client: TestClient) -> None:
    r = client.get(
        "/api/portal/summary",
        headers={"X-Dev-Tenant-Slug": "alpha", "X-Dev-User-Sub": "alice"},
    )
    assert r.status_code == 200
    b = r.json()
    assert b["holdings_count"] == 2
    assert b["distinct_securities_count"] == 2
    assert b["distributions_count"] >= 1


def test_security_detail_cross_tenant_hidden(client: TestClient) -> None:
    r = client.get(
        "/api/securities",
        headers={"X-Dev-Tenant-Slug": "beta", "X-Dev-User-Sub": "bob"},
    )
    sid = r.json()["items"][0]["id"]
    r2 = client.get(
        f"/api/securities/{sid}",
        headers={"X-Dev-Tenant-Slug": "alpha", "X-Dev-User-Sub": "alice"},
    )
    assert r2.status_code == 404


def test_notices_tenant_scoped(client: TestClient) -> None:
    ra = client.get(
        "/api/notices",
        headers={"X-Dev-Tenant-Slug": "alpha", "X-Dev-User-Sub": "alice"},
    )
    rb = client.get(
        "/api/notices",
        headers={"X-Dev-Tenant-Slug": "beta", "X-Dev-User-Sub": "bob"},
    )
    assert ra.status_code == 200 and rb.status_code == 200
    ta = {n["title"] for n in ra.json()["items"]}
    tb = {n["title"] for n in rb.json()["items"]}
    assert "e-Dividend mandate reminder" in ta
    assert "Registrar holiday hours" in tb
    assert "Registrar holiday hours" not in ta
