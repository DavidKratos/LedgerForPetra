import type { Metadata } from "next";
import "./erp.css";
import "./nature.css";
import "./login.css";

export const metadata: Metadata = {
  title: "LedgerDesk · Business, in balance",
  description: "Your private workspace for invoices, customers, products and payments.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
