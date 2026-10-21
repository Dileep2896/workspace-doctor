import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: { default: "Workspace Doctor for agent-built CRMs", template: "%s · Workspace Doctor" },
  description: "Find, explain and fix the CRM objects your agent broke. A self-healing integrity checker for agent-built CRM workspaces.",
};

export const viewport: Viewport = { themeColor: "#09090b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-ink">
        <ThemeProvider>
          <SiteNav />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
