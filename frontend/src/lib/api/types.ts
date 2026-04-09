export type DistributionStatus = "declared" | "paid" | "unclaimed";

export type Holding = {
  id: string;
  security_id: string;
  issuer_name: string;
  symbol: string;
  quantity: string;
  as_of_date: string;
  isin: string | null;
  mic: string | null;
  asset_class: string | null;
};

export type Distribution = {
  id: string;
  security_id: string | null;
  amount: string;
  currency: string;
  status: DistributionStatus;
  pay_date: string | null;
};

export type TenantPortalConfig = {
  display_currency: string;
  locale: string;
  firm_legal_name: string;
  tagline: string;
  support_email: string;
  support_phone: string;
  address_line: string;
  regulatory_note: string;
};

export type PortalMe = {
  portal_user_id: string;
  external_sub: string;
  display_name: string | null;
  shareholder_ref: string;
  tenant_slug: string;
  tenant_name: string;
};

export type PortalSummary = {
  holdings_count: number;
  distributions_count: number;
  distinct_securities_count: number;
  ytd_paid_total_display_currency: string;
  last_distribution_pay_date: string | null;
  as_of: string;
};

export type ActivityItem = {
  action: string;
  resource_type: string;
  created_at: string;
};

export type SecuritySummary = {
  id: string;
  symbol: string;
  issuer_name: string;
  isin: string | null;
  mic: string | null;
  asset_class: string | null;
};

export type SecurityDetail = SecuritySummary & {
  description: string | null;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  published_at: string;
};
