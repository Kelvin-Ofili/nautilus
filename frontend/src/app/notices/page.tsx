"use client";

import { useEffect, useState } from "react";
import { fetchNotices, fetchTenantPortalConfig } from "@/lib/api/client";
import type { Notice, TenantPortalConfig } from "@/lib/api/types";

export default function NoticesPage() {
  const [items, setItems] = useState<Notice[] | null>(null);
  const [cfg, setCfg] = useState<TenantPortalConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchNotices(), fetchTenantPortalConfig()])
      .then(([n, c]) => {
        if (!cancelled) {
          setItems(n);
          setCfg(c);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load notices");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 p-6">{error}</div>;
  }

  if (items === null || cfg === null) {
    return (
      <div className="text-muted flex items-center gap-3">
        <span className="inline-block h-4 w-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        Loading notices…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-display text-3xl text-navy">Shareholder notices</h2>
        <p className="text-muted mt-2 max-w-3xl">
          Official communications channel for registrar-led reminders. This does not replace statutory
          issuer notices mailed or filed per local rules.
        </p>
      </div>

      <ul className="space-y-6">
        {items.map((n) => (
          <li key={n.id} className="bg-paper border border-line rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2 items-start">
              <h3 className="font-serif-display text-xl text-navy">{n.title}</h3>
              <time
                className="text-xs text-muted whitespace-nowrap"
                dateTime={n.published_at}
              >
                {new Date(n.published_at).toLocaleDateString(cfg.locale, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            <p className="text-muted mt-4 leading-relaxed whitespace-pre-wrap">{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
