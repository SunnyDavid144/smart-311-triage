import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart 311 Triage",
  description: "AI-powered municipal complaint routing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>{children}</body>
    </html>
  );
}
