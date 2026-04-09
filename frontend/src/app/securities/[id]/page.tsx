/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSecurityDetail } from "@/lib/api/client";
import type { SecurityDetail } from "@/lib/api/types";

export default function SecurityDetailPage() {
  const params = useParams();
  const id = params.id || "";
  const [sec, setSec] = useState<SecurityDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchSecurityDetail(id)
      .then((s) => {
        if (!cancelled) setSec(s);
      })
      .catch(() => {
        if (!cancelled) setError("Security not found or not in your positions.");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-950 p-6">{error}</div>
        <a href="/securities" className="text-gold-dim hover:text-gold font-medium text-sm">
          ← Back to securities
        </a>
      </div>
    );
  }

  if (!sec) {
    return (
      <div className="text-muted flex items-center gap-3">
        <span className="inline-block h-4 w-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <a href="/securities" className="text-gold-dim hover:text-gold font-medium text-sm inline-block">
        ← Back to securities
      </a>

      <div className="bg-paper border border-line rounded-xl p-8 shadow-sm max-w-3xl">
        <p className="text-gold-dim text-xs font-semibold tracking-wider uppercase">Security profile</p>
        <h2 className="font-serif-display text-4xl text-navy mt-2">{sec.symbol}</h2>
        <p className="text-xl text-navy/90 mt-1">{sec.issuer_name}</p>

        <dl className="mt-8 grid sm:grid-cols-2 gap-6 text-sm">
          <div>
            <dt className="text-muted text-xs uppercase tracking-wide">ISIN</dt>
            <dd className="font-mono mt-1">{sec.isin ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs uppercase tracking-wide">MIC</dt>
            <dd className="font-mono mt-1">{sec.mic ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted text-xs uppercase tracking-wide">Asset class</dt>
            <dd className="mt-1">{sec.asset_class ?? "—"}</dd>
          </div>
        </dl>

        {sec.description ? (
          <div className="mt-8 pt-8 border-t border-line">
            <h3 className="font-semibold text-navy text-sm uppercase tracking-wide">Description</h3>
            <p className="text-muted mt-2 leading-relaxed">{sec.description}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
