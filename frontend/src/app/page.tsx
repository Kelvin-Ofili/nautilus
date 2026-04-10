import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import {
  fetchNotices,
  fetchPortalActivity,
  fetchPortalMe,
  fetchPortalSummary,
  fetchTenantPortalConfig,
} from "@/lib/api/client";
import { formatMoneyAmount } from "@/lib/format-money";
import type { ActivityItem, Notice, PortalMe, PortalSummary, TenantPortalConfig } from "@/lib/api/types";

export default function DashboardPage() {
  const [me, setMe] = useState<PortalMe | null>(null);
  const [summary, setSummary] = useState<PortalSummary | null>(null);
  const [cfg, setCfg] = useState<TenantPortalConfig | null>(null);
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchPortalMe(),
      fetchPortalSummary(),
      fetchTenantPortalConfig(),
      fetchNotices(),
      fetchPortalActivity(),
    ])
      .then(([m, s, c, n, a]) => {
        if (!cancelled) {
          setMe(m);
          setSummary(s);
          setCfg(c);
          setNotices(n);
          setActivity(a);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="card border-error/50 bg-error/10">
        <p className="text-error font-semibold">⚠️ Error loading dashboard</p>
        <p className="text-text-secondary text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!me || !summary || !cfg || !notices || !activity) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-text-secondary">🧠 AI is analyzing your portfolio…</p>
        </div>
      </div>
    );
  }

  const ytdFormatted = formatMoneyAmount(
    summary.ytd_paid_total_display_currency,
    cfg.display_currency,
    cfg.locale,
  );

  return (
    <div className="space-y-12">
      {/* Welcome section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary-dark/20 rounded-2xl blur-3xl opacity-50 -z-10"></div>
        <div className="card bg-gradient-to-br from-surface-light/60 to-surface/30 border-primary/30">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-serif-display text-4xl bg-gradient-to-r from-primary via-accent-light to-primary bg-clip-text text-transparent">
                Welcome back{displayName(me)}
              </h2>
              <p className="text-text-secondary mt-3 max-w-2xl">
                Your intelligent portfolio dashboard powered by AI analytics. <br />
                <span className="text-xs">Registrar records for <strong>{me.tenant_name}</strong></span>
              </p>
            </div>
            <div className="text-5xl">📊</div>
          </div>
          <div className="pt-4 border-t border-border/50 mt-4">
            <p className="text-text-secondary text-xs">
              <span className="text-primary font-semibold">Investor ID:</span> <span className="font-mono bg-surface/50 px-2 py-1 rounded">{me.shareholder_ref}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Key metrics */}
      <section>
        <h3 className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-4">🎯 Portfolio Overview</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Active Holdings"
            value={summary.holdings_count}
            icon="💼"
            hint={`${summary.as_of}`}
            gradient="primary"
          />
          <StatCard
            label="Issuers"
            value={summary.distinct_securities_count}
            icon="🏢"
            hint="Unique securities"
            gradient="accent"
          />
          <StatCard
            label="Distributions"
            value={summary.distributions_count}
            icon="💵"
            hint="Historical events"
            gradient="success"
          />
          <StatCard
            label="YTD Paid"
            value={ytdFormatted}
            icon="📈"
            hint={summary.last_distribution_pay_date ? `Last: ${summary.last_distribution_pay_date}` : "N/A"}
            gradient="warning"
          />
        </div>
      </section>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Notices - larger */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-text-secondary text-xs font-bold uppercase tracking-widest">
              📬 Shareholder Updates
            </h3>
            <a href="/notices" className="text-primary text-sm font-semibold hover:text-primary-dark transition-colors">
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {notices.slice(0, 4).map((n) => (
              <div key={n.id} className="card-hover group cursor-pointer">
                <div className="flex gap-3">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text font-semibold group-hover:text-primary transition-colors">
                      {n.title}
                    </p>
                    <p className="text-text-secondary text-sm mt-1 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-primary/60 text-xs mt-2 group-hover:text-primary/80 transition-colors">
                      {new Date(n.published_at).toLocaleDateString(cfg.locale, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <h3 className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-5">
            ⚡ Activity Log
          </h3>
          <div className="card">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activity.slice(0, 10).map((a, i) => (
                <div key={`${a.created_at}-${i}`} className="pb-3 border-b border-border/50 last:border-0">
                  <p className="text-text/80 text-xs font-mono font-semibold uppercase text-primary">
                    {a.action}
                  </p>
                  <p className="text-text-secondary text-xs mt-1">
                    {new Date(a.created_at).toLocaleString(cfg.locale, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Action buttons */}
      <section className="flex flex-wrap gap-3">
        <a
          href="/holdings"
          className="btn-primary group"
        >
          💼 Review Holdings
        </a>
        <a
          href="/distributions"
          className="btn-secondary hover:border-primary/50"
        >
          → Distribution History
        </a>
        <a
          href="/securities"
          className="btn-secondary hover:border-accent/50">
          → Securities
        </a>
      </section>

      {/* Footer note */}
      <section className="text-center py-6 border-t border-border/50">
        <p className="text-text-secondary text-xs max-w-2xl mx-auto">
          ℹ️ This portal reflects <strong>registrar records</strong> only. For investment decisions, consult your professional advisers. All data is encrypted and secure.
        </p>
      </section>
    </div>
  );
}

function displayName(me: PortalMe): string {
  if (me.display_name) return `, ${me.display_name.split(" ")[0]}`;
  return "";
}
