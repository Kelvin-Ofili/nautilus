import type {
  Distribution,
  Holding,
  Notice,
  PortalMe,
  PortalSummary,
  SecurityDetail,
  SecuritySummary,
  TenantPortalConfig,
} from "./types";

export const mockTenantConfigAlpha: TenantPortalConfig = {
  display_currency: "USD",
  locale: "en-US",
  firm_legal_name: "SavvyBee Ltd",
  tagline: "Clarity for shareholders. Integrity in every register.",
  support_email: "shareholder.services@savvybee.example",
  support_phone: "+2347052640276",
  address_line: "10, Victor Bamiro Street, Alapere, Lagos, Nigeria",
  regulatory_note: "Information is provided for convenience only and does not constitute investment, tax, or legal advice. Confirm material matters with your professional advisers. SavvyBee demo data — not affiliated with any external brand.",
};

export const mockMeAlice: PortalMe = {
  portal_user_id: "00000000-0000-4000-8000-000000000001",
  external_sub: "alice",
  display_name: "Alice A.",
  shareholder_ref: "shr-alpha-alice",
  tenant_slug: "alpha",
  tenant_name: "SavvyBee Ltd",
};

export const mockSummaryAlice: PortalSummary = {
  holdings_count: 2,
  distributions_count: 3,
  distinct_securities_count: 2,
  ytd_paid_total_display_currency: "167.50",
  last_distribution_pay_date: "2026-02-15",
  as_of: "2026-03-31",
};

export const mockHoldingsAlice: Holding[] = [
  {
    id: "00000000-0000-4000-8000-000000000010",
    security_id: "00000000-0000-4000-8000-000000000100",
    issuer_name: "ACME Corporation",
    symbol: "ACME",
    quantity: "1000.00000000",
    as_of_date: "2026-03-31",
    isin: "US0001234567",
    mic: "XNAS",
    asset_class: "Common equity",
  },
  {
    id: "00000000-0000-4000-8000-000000000011",
    security_id: "00000000-0000-4000-8000-000000000101",
    issuer_name: "Longbridge Financial Group",
    symbol: "LONG",
    quantity: "250.00000000",
    as_of_date: "2026-03-31",
    isin: "US0007654321",
    mic: "XNYS",
    asset_class: "Depositary receipt",
  },
];

export const mockDistributionsAlice: Distribution[] = [
  {
    id: "00000000-0000-4000-8000-000000000020",
    security_id: "00000000-0000-4000-8000-000000000100",
    amount: "125.50",
    currency: "USD",
    status: "paid",
    pay_date: "2026-02-15",
  },
  {
    id: "00000000-0000-4000-8000-000000000021",
    security_id: "00000000-0000-4000-8000-000000000101",
    amount: "42.00",
    currency: "USD",
    status: "paid",
    pay_date: "2026-01-10",
  },
  {
    id: "00000000-0000-4000-8000-000000000022",
    security_id: "00000000-0000-4000-8000-000000000100",
    amount: "18.25",
    currency: "USD",
    status: "unclaimed",
    pay_date: null,
  },
];

export const mockSecuritiesAlice: SecuritySummary[] = mockHoldingsAlice.map((h) => ({
  id: h.security_id,
  symbol: h.symbol,
  issuer_name: h.issuer_name,
  isin: h.isin,
  mic: h.mic,
  asset_class: h.asset_class,
}));

export const mockSecurityDetails: Record<string, SecurityDetail> = {
  "00000000-0000-4000-8000-000000000100": {
    id: "00000000-0000-4000-8000-000000000100",
    symbol: "ACME",
    issuer_name: "ACME Corporation",
    isin: "US0001234567",
    mic: "XNAS",
    asset_class: "Common equity",
    description: "Large-cap industrial conglomerate (illustrative).",
  },
  "00000000-0000-4000-8000-000000000101": {
    id: "00000000-0000-4000-8000-000000000101",
    symbol: "LONG",
    issuer_name: "Longbridge Financial Group",
    isin: "US0007654321",
    mic: "XNYS",
    asset_class: "Depositary receipt",
    description: "Diversified financial services holding company (illustrative).",
  },
};

export const mockNoticesAlpha: Notice[] = [
  {
    id: "00000000-0000-4000-8000-000000000300",
    title: "e-Dividend mandate reminder",
    body: "Completing your e-mandate helps ensure timely distribution credits.",
    published_at: "2026-04-08T12:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000301",
    title: "Annual general meeting materials",
    body: "AGM notices will be distributed in accordance with issuer timelines.",
    published_at: "2026-03-01T12:00:00Z",
  },
];
