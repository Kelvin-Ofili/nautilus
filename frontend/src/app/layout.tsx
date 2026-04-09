import { PortalShell } from "@/components/PortalShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PortalShell>{children}</PortalShell>;
}
