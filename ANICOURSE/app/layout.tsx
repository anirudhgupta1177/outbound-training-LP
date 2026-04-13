import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IntentLedSales | Outbound Mastery",
  description: "Comprehensive outbound marketing and lead generation training by IntentLedSales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

