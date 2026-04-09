import { useEffect, useState } from "react";
import { fetchSecurities } from "@/lib/api/client";
import type { SecuritySummary } from "@/lib/api/types";

export default function SecuritiesPage() {
  const [items, setItems] = useState<SecuritySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSecurities()
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load securities");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 p-6">{error}</div>;
  }

  if (items === null) {
    return (
      <div className="text-muted flex items-center gap-3">
        <span className="inline-block h-4 w-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        Loading securities…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-display text-3xl text-navy">Your securities</h2>
        <p className="text-muted mt-2 max-w-3xl">
          Detail is available only for issuers where you hold a position — consistent with
          least-privilege access to register extracts.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {items.map((s) => (
          <a
            key={s.id}
            href={`/securities/${s.id}`}
            className="group bg-paper border border-line rounded-xl p-6 shadow-sm hover:border-gold/50 hover:shadow-md transition-all block"
          >
            <p className="text-gold-dim text-xs font-semibold tracking-wider uppercase">Issuer</p>
            <h3 className="font-serif-display text-xl text-navy mt-1 group-hover:text-gold-dim transition-colors">
              {s.symbol}
            </h3>
            <p className="text-navy font-medium mt-1">{s.issuer_name}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted text-xs">ISIN</dt>
                <dd className="font-mono text-xs">{s.isin ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted text-xs">MIC</dt>
                <dd className="font-mono text-xs">{s.mic ?? "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted text-xs">Asset class</dt>
                <dd>{s.asset_class ?? "—"}</dd>
              </div>
            </dl>
            <p className="text-gold text-sm font-medium mt-4">View issuer profile →</p>
          </a>
        ))}
      </div>
    </div>
  );
}
