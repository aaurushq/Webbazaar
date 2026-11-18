import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "WebBazaar — Find a website. Make it yours.",
  description:
    "Discover ready-made websites and apps from independent developers. Preview live demos, connect with sellers, and customize your next project.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  keywords: [
    "Ready Made Websites",
    "Buy Websites India",
    "SaaS Web Apps",
    "Next.js Websites",
    "Independent Developer Marketplace",
    "WebBazaar",
  ],
  authors: [{ name: "WebBazaar" }],
  openGraph: {
    title: "WebBazaar — Find a website. Make it yours.",
    description:
      "Discover ready-made websites and apps from independent developers. Preview live demos, connect with sellers, and customize your next project.",
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
      <body className="flex min-h-screen flex-col bg-white text-brand-dark font-sans antialiased overflow-x-hidden">
        <Header />
        <main className="flex-1 min-w-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
