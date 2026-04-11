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
    <div className="portal-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white text-sm font-bold">
              {cfg?.firm_legal_name?.charAt(0) ?? "S"}
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                {cfg?.firm_legal_name ?? "Loading"}
              </h1>
              <p className="text-xs text-gray-500">{cfg?.tagline ?? ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {cfg?.support_phone && (
              <a href={`tel:${cfg.support_phone.replace(/\s/g, "")}`} className="text-gray-600 hover:text-gray-900">
                {cfg.support_phone}
              </a>
            )}
            {cfg?.support_email && (
              <a href={`mailto:${cfg.support_email}`} className="text-gray-600 hover:text-gray-900">
                {cfg.support_email}
              </a>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-gray-200 bg-gray-50">
          <ul className="mx-auto max-w-7xl px-4 flex overflow-x-auto">
            {nav.map((item) => {
              const active = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      active
                        ? "text-gray-900 border-primary"
                        : "text-gray-600 border-transparent hover:text-gray-900"
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
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white text-gray-600 text-xs mt-12">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {cfg?.address_line && (
            <p className="mb-4 text-gray-700">{cfg.address_line}</p>
          )}
          <p className="mb-2">{cfg?.regulatory_note ?? ""}</p>
          <p className="text-gray-500">
            © {new Date().getFullYear()} {cfg?.firm_legal_name ?? "Nautilus"}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
