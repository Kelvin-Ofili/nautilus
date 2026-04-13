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
      <div className="card border border-red-200 bg-red-50 max-w-2xl mx-auto">
        <p className="text-red-900 font-semibold">Error loading dashboard</p>
        <p className="text-red-700 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!me || !summary || !cfg || !notices || !activity) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block mb-3">
            <div className="w-7 h-7 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 text-sm">Loading your dashboard...</p>
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
    <div className="space-y-8">
      {/* Welcome section */}
      <section>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back{displayName(me)}
        </h1>
        <p className="text-gray-600 text-sm mb-4">
          Here is an overview of your portfolio with {cfg.firm_legal_name}.
        </p>
        <p className="text-xs text-gray-500">
          <span className="font-semibold">Investor ID:</span> {me.shareholder_ref}
        </p>
      </section>

      {/* Key metrics */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Portfolio Overview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Holdings"
            value={summary.holdings_count}
            hint={`As of ${summary.as_of}`}
          />
          <StatCard
            label="Issuers"
            value={summary.distinct_securities_count}
            hint="Active securities"
          />
          <StatCard
            label="Distributions"
            value={summary.distributions_count}
            hint="Historical"
          />
          <StatCard
            label="YTD Paid"
            value={ytdFormatted}
            hint={summary.last_distribution_pay_date ? `Last: ${summary.last_distribution_pay_date}` : "N/A"}
          />
        </div>
      </section>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Notices - larger */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Updates</h2>
            <a href="/notices" className="text-primary text-xs font-semibold hover:text-blue-700">
              View all →
            </a>
          </div>
          <div className="space-y-2">
            {notices.slice(0, 5).map((n) => (
              <div key={n.id} className="card-hover cursor-pointer">
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
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
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Activity</h2>
          <div className="card">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activity.slice(0, 10).map((a, i) => (
                <div key={`${a.created_at}-${i}`} className="pb-3 border-b border-gray-200 last:border-0">
                  <p className="text-xs font-mono font-semibold text-gray-600 uppercase">
                    {a.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
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
        <a href="/holdings" className="btn btn-primary">
          Review Holdings
        </a>
        <a href="/distributions" className="btn btn-secondary">
          Distribution History
        </a>
        <a href="/securities" className="btn btn-secondary">
          Securities
        </a>
      </section>

      {/* Footer note */}
      <section className="border-t border-gray-200 pt-6">
        <p className="text-gray-600 text-xs max-w-2xl">
          This portal reflects registrar records only. For investment decisions, consult your professional advisers.
        </p>
      </section>
    </div>
  );
}

function displayName(me: PortalMe): string {
  if (me.display_name) return `, ${me.display_name.split(" ")[0]}`;
  return "";
}
