import { useEffect, useState } from "react";
import { fetchDistributions, fetchTenantPortalConfig } from "@/lib/api/client";
import { formatMoneyAmount } from "@/lib/format-money";
import type { Distribution, TenantPortalConfig } from "@/lib/api/types";

export default function DistributionsPage() {
  const [items, setItems] = useState<Distribution[] | null>(null);
  const [display, setDisplay] = useState<TenantPortalConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDistributions(), fetchTenantPortalConfig()])
      .then(([rows, cfg]) => {
        if (!cancelled) {
          setItems(rows);
          setDisplay(cfg);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load distributions");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 p-6">{error}</div>;
  }

  if (items === null || display === null) {
    return (
      <div className="text-muted flex items-center gap-3">
        <span className="inline-block h-4 w-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        Loading distributions…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-paper border border-line rounded-xl p-10 text-center">
        <h2 className="font-serif-display text-2xl text-navy">No distributions on record</h2>
        <p className="text-muted mt-2">Declared or paid distributions will appear here when posted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-display text-3xl text-navy">Distributions</h2>
        <p className="text-muted mt-2 max-w-3xl">
          Status reflects registrar processing. <strong>Unclaimed</strong> items may require updated
          bank mandates or KYC — follow notices or contact support.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-paper shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-navy/5 text-left text-xs uppercase tracking-wider text-muted border-b border-line">
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">CCY</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Pay date</th>
              <th className="px-4 py-3 font-semibold">Security ref</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} className="border-b border-line last:border-0 hover:bg-cream/80">
                <td className="px-4 py-3 font-semibold text-navy">
                  {formatMoneyAmount(d.amount, d.currency, display.locale)}
                </td>
                <td className="px-4 py-3 font-mono">{d.currency}</td>
                <td className="px-4 py-3">
                  <StatusPill status={d.status} />
                </td>
                <td className="px-4 py-3 text-muted">{d.pay_date ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{d.security_id ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Distribution["status"] }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-900 border-emerald-200",
    declared: "bg-amber-100 text-amber-900 border-amber-200",
    unclaimed: "bg-rose-100 text-rose-900 border-rose-200",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${styles[status] ?? "bg-neutral-100"}`}
    >
      {status}
    </span>
  );
}
