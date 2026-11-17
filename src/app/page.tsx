"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Coins,
  CheckCircle,
  Eye,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_LISTINGS } from "@/data/demo-listings";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { CategoryCard } from "@/components/marketplace/CategoryCard";

export default function HomePage() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = React.useState("");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      router.push("/marketplace");
    }
  };

  const featuredListings = DEMO_LISTINGS.filter((item) => item.isFeatured).slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              <span>The India-First Digital Asset Marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Find Your Perfect Website. <br className="hidden sm:inline" />
              <span className="text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-800">
                Customize It. Launch Faster.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover ready-made websites, premium templates, source code, online businesses and expert developers — all in one trusted marketplace.
            </p>

            {/* Prominent Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="max-w-2xl mx-auto mt-8 flex flex-col sm:flex-row gap-2 p-2 bg-white rounded-2xl shadow-lg border border-slate-200 focus-within:ring-2 focus-within:ring-primary-600 focus-within:border-transparent transition-all"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 'restaurant booking', 'SaaS boilerplate', 'affiliate blog'..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>
              <Button type="submit" size="lg" className="gap-2 sm:px-8 font-semibold shadow-md">
                <span>Search</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* CTAs & Quick Filters */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="text-xs text-slate-400 font-medium">Popular:</span>
              {["Next.js Boilerplates", "Cloud Kitchens", "GST SaaS", "Doctor Portals"].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => router.push(`/marketplace?q=${encodeURIComponent(term)}`)}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Trust Points */}
            <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500 font-medium border-t border-slate-200/80 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified Code Quality</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Coins className="h-4 w-4 text-primary-600" />
                <span>Transparent INR Pricing</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Lock className="h-4 w-4 text-amber-600" />
                <span>Safe Delivery Protocol</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Zap className="h-4 w-4 text-sky-600" />
                <span>Ready to Launch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUR CORE VERTICALS SECTION */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Four Marketplace Verticals
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need to Own the Web
            </h2>
            <p className="text-sm text-slate-600">
              Whether you need a fully-functional site, clean code snippets, an acquisition target, or custom development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard
              title="Ready-Made Websites"
              description="Complete turnkey web applications with backend and database. Deploy and start taking customers in hours."
              iconName="globe"
              href="/ready-websites"
              countLabel="8 Live Assets"
              accentColor="indigo"
            />
            <CategoryCard
              title="Templates & Code"
              description="Production-grade SaaS boilerplates, UI libraries, themes and full-stack scripts ready for developers."
              iconName="code"
              href="/templates"
              countLabel="8 Starter Kits"
              accentColor="emerald"
            />
            <CategoryCard
              title="Online Businesses"
              description="Cash-flowing SaaS, content hubs, and e-commerce stores available for direct founder acquisition."
              iconName="briefcase"
              href="/businesses"
              countLabel="4 Deals Active"
              accentColor="amber"
            />
            <CategoryCard
              title="Custom Services"
              description="Hire verified creators for rebranding, cloud deployments, payment gateways, and feature extensions."
              iconName="wrench"
              href="/services"
              countLabel="4 Packages"
              accentColor="sky"
            />
          </div>
        </div>
      </section>

      {/* 3. FEATURED LISTINGS GRID */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-1">
                Hand-Picked Assets
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Marketplace Listings
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore popular ready-to-deploy platforms and verified codebases.
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2 self-start sm:self-auto">
              <Link href="/marketplace">
                <span>View Full Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (BUYER JOURNEY) */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Simple & Reliable
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How WebBazaar Works
            </h2>
            <p className="text-sm text-slate-600">
              From discovery to launch in four transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-primary-600 font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Discover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by vertical, business model, tech stack (Next.js, Supabase), and price range in INR.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700 font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Preview</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interact with live demo environments, test admin dashboards, and inspect transparent tech specs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Connect or Buy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant digital delivery for templates, or request due diligence and NDA for online businesses.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 font-bold text-lg mb-4">
                4
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Customize & Launch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rebrand yourself or hire the original creator through our integrated service add-ons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SELLER PROMOTION CTA BANNER */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-teal-400 text-xs font-semibold">
                <Rocket className="h-3.5 w-3.5" />
                <span>For Indian Developers, Studios & Founders</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Turn Your Code Into Income.
              </h2>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                Have you built side projects, production boilerplate repos, or turnkey websites? Monetize your digital assets with verified Indian buyers. Keep up to 88% of your revenue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button asChild size="lg" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold">
                <Link href="/sell">
                  <span>Explore Seller Program</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
