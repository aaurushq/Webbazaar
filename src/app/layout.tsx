import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DemoNoticeBanner } from "@/components/layout/DemoNoticeBanner";

export const metadata: Metadata = {
  title: "WebBazaar — India's Marketplace for Ready Websites, Code & Online Businesses",
  description:
    "Discover ready-made websites, premium templates, source code, online businesses for sale, and expert website customization services in India.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  keywords: [
    "Ready Made Websites India",
    "Buy Online Business India",
    "Next.js Templates",
    "Source Code Marketplace",
    "Website Customization Services",
    "Micro SaaS Acquisition",
  ],
  authors: [{ name: "WebBazaar Engineering" }],
  openGraph: {
    title: "WebBazaar — Discover. Customize. Launch.",
    description:
      "India-first marketplace for ready-made websites, templates, source code, online businesses and custom development services.",
    siteName: "WebBazaar",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans antialiased">
        <DemoNoticeBanner />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
