import type {
  ActivityItem,
  Distribution,
  Holding,
  Notice,
  PortalMe,
  PortalSummary,
  SecurityDetail,
  SecuritySummary,
  TenantPortalConfig,
} from "./types";
import {
  mockDistributionsAlice,
  mockHoldingsAlice,
  mockMeAlice,
  mockNoticesAlpha,
  mockSecuritiesAlice,
  mockSecurityDetails,
  mockSummaryAlice,
  mockTenantConfigAlpha,
} from "./mock-data";

const useMock = import.meta.env.VITE_USE_MOCK_API === "true";

function devHeaders(): HeadersInit {
  const tenant = import.meta.env.VITE_DEV_TENANT_SLUG ?? "alpha";
  const sub = import.meta.env.VITE_DEV_USER_SUB ?? "alice";
  return {
    "X-Dev-Tenant-Slug": tenant,
    "X-Dev-User-Sub": sub,
  };
}

async function apiGet<T>(path: string): Promise<T> {
  // Priority: window.VITE_API_URL (runtime) → build-time env var → localhost default
  const base = (typeof window !== "undefined" && (window as any).VITE_API_URL) ||
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8001";
  const res = await fetch(`${base}${path}`, {
    headers: {
      Accept: "application/json",
      ...devHeaders(),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export async function fetchTenantPortalConfig(): Promise<TenantPortalConfig> {
  if (useMock) return mockTenantConfigAlpha;
  return apiGet<TenantPortalConfig>("/api/tenant/config");
}

export async function fetchPortalMe(): Promise<PortalMe> {
  if (useMock) return mockMeAlice;
  return apiGet<PortalMe>("/api/portal/me");
}

export async function fetchPortalSummary(): Promise<PortalSummary> {
  if (useMock) return mockSummaryAlice;
  return apiGet<PortalSummary>("/api/portal/summary");
}

export async function fetchPortalActivity(): Promise<ActivityItem[]> {
  if (useMock) {
    return [
      {
        action: "shareholder.holdings.view",
        resource_type: "holdings",
        created_at: "2026-04-08T10:00:00Z",
      },
    ];
  }
  const data = await apiGet<{ items: ActivityItem[] }>("/api/portal/activity");
  return data.items;
}

export async function fetchHoldings(): Promise<Holding[]> {
  if (useMock) return mockHoldingsAlice;
  const data = await apiGet<{ items: Holding[] }>("/api/holdings");
  return data.items;
}

export async function fetchDistributions(): Promise<Distribution[]> {
  if (useMock) return mockDistributionsAlice;
  const data = await apiGet<{ items: Distribution[] }>("/api/distributions");
  return data.items;
}

export async function fetchSecurities(): Promise<SecuritySummary[]> {
  if (useMock) return mockSecuritiesAlice;
  const data = await apiGet<{ items: SecuritySummary[] }>("/api/securities");
  return data.items;
}

export async function fetchSecurityDetail(id: string): Promise<SecurityDetail> {
  if (useMock) {
    const d = mockSecurityDetails[id];
    if (!d) throw new Error("Not found");
    return d;
  }
  return apiGet<SecurityDetail>(`/api/securities/${id}`);
}

export async function fetchNotices(): Promise<Notice[]> {
  if (useMock) return mockNoticesAlpha;
  const data = await apiGet<{ items: Notice[] }>("/api/notices");
  return data.items;
}

/** @deprecated Use fetchTenantPortalConfig */
export async function fetchTenantDisplayConfig(): Promise<TenantPortalConfig> {
  return fetchTenantPortalConfig();
}
