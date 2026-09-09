import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veylix — Enterprise Asset Inventory Platform",
  description:
    "Modern, modular, and resilient physical asset management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
