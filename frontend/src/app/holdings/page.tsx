import { useEffect, useState } from "react";
import { fetchHoldings } from "@/lib/api/client";
import type { Holding } from "@/lib/api/types";

export default function HoldingsPage() {
  const [items, setItems] = useState<Holding[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHoldings()
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load holdings");
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
        Loading holdings…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-paper border border-line rounded-xl p-10 text-center">
        <h2 className="font-serif-display text-2xl text-navy">No positions on record</h2>
        <p className="text-muted mt-2 max-w-md mx-auto">
          Your register extract shows no open holdings. Contact shareholder services if this looks
          incorrect.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-display text-3xl text-navy">Holdings register extract</h2>
        <p className="text-muted mt-2 max-w-3xl">
          Quantities and identifiers are shown as recorded by the registrar. ISIN and MIC are
          illustrative where provided; confirm critical fields against issuer communications.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-paper shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-navy/5 text-left text-xs uppercase tracking-wider text-muted border-b border-line">
              <th className="px-4 py-3 font-semibold">Symbol</th>
              <th className="px-4 py-3 font-semibold">Issuer</th>
              <th className="px-4 py-3 font-semibold">ISIN</th>
              <th className="px-4 py-3 font-semibold">MIC</th>
              <th className="px-4 py-3 font-semibold">Class</th>
              <th className="px-4 py-3 font-semibold text-right">Quantity</th>
              <th className="px-4 py-3 font-semibold">As of</th>
            </tr>
          </thead>
          <tbody>
            {items.map((h) => (
              <tr key={h.id} className="border-b border-line last:border-0 hover:bg-cream/80">
                <td className="px-4 py-3 font-semibold text-navy">{h.symbol}</td>
                <td className="px-4 py-3 text-navy">{h.issuer_name}</td>
                <td className="px-4 py-3 font-mono text-xs">{h.isin ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{h.mic ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{h.asset_class ?? "—"}</td>
                <td className="px-4 py-3 text-right font-mono">{h.quantity}</td>
                <td className="px-4 py-3 text-muted">{h.as_of_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
