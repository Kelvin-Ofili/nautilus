import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchTenantPortalConfig } from "@/lib/api/client";
import type { TenantPortalConfig } from "@/lib/api/types";

const nav = [
  { href: "/", label: "Overview", icon: "📊" },
  { href: "/holdings", label: "Holdings", icon: "💼" },
  { href: "/securities", label: "Securities", icon: "📈" },
  { href: "/distributions", label: "Distributions", icon: "💵" },
  { href: "/notices", label: "Updates", icon: "📬" },
];

interface PortalShellProps {
  children: React.ReactNode
}

export function PortalShell({ children }: PortalShellProps) {
  const location = useLocation();
  const [cfg, setCfg] = useState<TenantPortalConfig | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchTenantPortalConfig()
      .then((c) => {
        if (!cancelled) setCfg(c);
      })
      .catch(() => {
        if (!cancelled)
          setCfg({
            display_currency: "USD",
            locale: "en-US",
            firm_legal_name: "Shareholder Portal",
            tagline: "Powered by AI Intelligence",
            support_email: "",
            support_phone: "",
            address_line: "",
            regulatory_note: "Unable to load tenant configuration.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="portal-bg min-h-screen flex flex-col relative">
      {/* Top bar with contact info */}
      <div className="bg-surface/50 backdrop-blur-xl border-b border-border text-xs text-text-secondary">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap gap-x-8 gap-y-2 justify-between items-center">
          <span className="flex items-center gap-2">
            <span className="text-primary">→</span>
            {cfg?.address_line || "Intelligent Financial Portal"}
          </span>
          <div className="flex flex-wrap gap-6">
            {cfg?.support_phone ? (
              <a className="hover:text-primary transition-colors" href={`tel:${cfg.support_phone.replace(/\s/g, "")}`}>
                📞 {cfg.support_phone}
              </a>
            ) : null}
            {cfg?.support_email ? (
              <a className="hover:text-primary transition-colors" href={`mailto:${cfg.support_email}`}>
                ✉️ {cfg.support_email}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Header with logo and branding */}
      <header className="bg-gradient-to-b from-surface-light/80 to-surface/40 backdrop-blur-xl border-b border-border shadow-2xl relative z-50">
        <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {/* AI Brain Icon */}
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-primary-dark flex items-center justify-center glow-primary">
              <span className="text-2xl">🧠</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 animate-pulse"></div>
            </div>
            
            <div>
              <p className="text-primary text-xs font-bold tracking-widest uppercase opacity-80 mb-1">
                {cfg?.firm_legal_name?.split(' ')[0] ?? "Portal"}
              </p>
              <h1 className="font-serif-display text-3xl lg:text-4xl bg-gradient-to-r from-primary via-accent-light to-primary bg-clip-text text-transparent">
                {cfg?.firm_legal_name ?? "Loading…"}
              </h1>
            </div>
          </div>

          {cfg?.tagline && (
            <div className="text-right">
              <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
                ✨ {cfg.tagline}
              </p>
              <p className="text-primary/60 text-xs mt-2">AI-Powered Analytics</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="border-t border-border/50 bg-gradient-to-r from-surface-light/40 to-surface/40 backdrop-blur-md">
          <ul className="mx-auto max-w-7xl px-4 flex flex-wrap gap-1 overflow-x-auto">
            {nav.map((item) => {
              const active = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                      active
                        ? "text-primary border-b-2 border-primary -mb-px bg-primary/5"
                        : "text-text-secondary hover:text-primary hover:bg-surface/30"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-12 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface/40 backdrop-blur-xl border-t border-border text-text-secondary text-xs leading-relaxed mt-auto relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="text-primary font-semibold mb-2">🔐 Security</p>
              <p className="text-text-secondary/80">Bank-grade encryption and data protection</p>
            </div>
            <div>
              <p className="text-accent font-semibold mb-2">⚡ Performance</p>
              <p className="text-text-secondary/80">Optimized for speed and reliability</p>
            </div>
            <div>
              <p className="text-primary font-semibold mb-2">🤖 AI Intelligence</p>
              <p className="text-text-secondary/80">Advanced analytics and insights</p>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-6">
            <p className="max-w-3xl mb-3">{cfg?.regulatory_note ?? ""}</p>
            <p className="text-text-secondary/60">
              © {new Date().getFullYear()} {cfg?.firm_legal_name ?? "Nautilus"}. Advanced registrar intelligence — not investment advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
