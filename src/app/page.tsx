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
  TrendingUp,
  Code2,
  Globe2,
  Briefcase,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_LISTINGS } from "@/data/demo-listings";
import { Listing } from "@/types/marketplace";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { getUnifiedMarketplaceListings } from "@/lib/listings/public";

export default function HomePage() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = React.useState("");
  const [featuredListings, setFeaturedListings] = React.useState<Listing[]>(
    DEMO_LISTINGS.filter((item) => item.isFeatured).slice(0, 6)
  );

  React.useEffect(() => {
    getUnifiedMarketplaceListings().then((items) => {
      // Prioritize verified approved listings + featured demo listings
      const liveItems = items.filter((item) => !item.isDemo);
      const featuredDemos = items.filter((item) => item.isDemo && item.isFeatured);
      const combined = [...liveItems, ...featuredDemos].slice(0, 6);
      if (combined.length > 0) {
        setFeaturedListings(combined);
      }
    });
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      router.push("/marketplace");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION WITH AMBIENT VFX & GLOW */}
      <section className="relative overflow-hidden bg-grid-pattern pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-200/80">
        {/* Ambient Glowing Background Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-primary-500/10 to-teal-400/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-40 -left-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none animate-float" />
        <div className="absolute top-32 -right-20 w-80 h-80 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-7">
            {/* Live Floating Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-indigo-200/70 shadow-xs backdrop-blur-md text-xs font-semibold transition-all hover:border-indigo-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="bg-gradient-to-r from-primary-600 to-indigo-700 bg-clip-text text-transparent font-bold">
                WEBBAZAAR 2.0
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">India&apos;s #1 Digital Asset Ecosystem</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Buy & Sell Verified <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-primary-600 to-teal-600 bg-clip-text text-transparent">
                Digital Assets & Codebases
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover production-ready websites, SaaS templates, turnkey micro-businesses, and vetted engineering packages — all priced transparently in INR.
            </p>

            {/* Glassmorphic Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="max-w-2xl mx-auto mt-8 flex flex-col sm:flex-row gap-2 p-2 bg-white/95 rounded-2xl shadow-xl shadow-indigo-500/5 border border-slate-200/90 focus-within:ring-2 focus-within:ring-primary-500/40 focus-within:border-primary-400 transition-all backdrop-blur-md"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 'Next.js boilerplate', 'GST SaaS', 'Doctor portal', 'E-commerce'..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>
              <Button type="submit" size="lg" className="gap-2 sm:px-8 font-semibold shadow-md shadow-primary-500/20">
                <span>Explore</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Quick Filter Tags with Micro-icons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="text-xs text-slate-400 font-medium">Trending searches:</span>
              {[
                { label: "Next.js Boilerplates", icon: Code2 },
                { label: "Fintech SaaS", icon: TrendingUp },
                { label: "Ready Portals", icon: Globe2 },
                { label: "E-Commerce Stores", icon: Briefcase },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => router.push(`/marketplace?q=${encodeURIComponent(item.label)}`)}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 hover:bg-indigo-50 hover:text-primary-700 hover:border-indigo-200 border border-transparent transition-colors"
                >
                  <item.icon className="h-3 w-3 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Trust Badges Strip */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600 font-medium border-t border-slate-200/80 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/60 border border-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Verified Source Code</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/60 border border-slate-100">
                <Coins className="h-4 w-4 text-primary-600 shrink-0" />
                <span>100% INR Transparency</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/60 border border-slate-100">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Escrow Safe Protocol</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/60 border border-slate-100">
                <Zap className="h-4 w-4 text-sky-600 shrink-0" />
                <span>Instant Code Handover</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS & REPUTATION STRIP */}
      <section className="py-8 bg-slate-900 text-white border-y border-slate-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">₹4.8 Cr+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Digital Asset Volume</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 tracking-tight">1,200+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Verified Codebases & Apps</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 tracking-tight">100%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Escrow Code Delivery</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">4.9 / 5</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Founder Trust Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE VERTICALS SECTION */}
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

      {/* 4. FEATURED LISTINGS GRID (LIVE + CURATED) */}
      <section className="py-16 sm:py-20 bg-slate-50/70 border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-1">
                Hand-Picked & Verified
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Marketplace Listings
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore popular ready-to-deploy platforms, verified database listings and vetted codebases.
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2 self-start sm:self-auto hover:border-primary-400">
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

      {/* 5. HOW IT WORKS (BUYER JOURNEY) */}
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
              From discovery to code handover in four transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-primary-600 font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Discover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by vertical, business model, tech stack (Next.js, Supabase), and price range in INR.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-teal-200 hover:bg-white hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700 font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Preview</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interact with live demo environments, test admin dashboards, and inspect transparent tech specs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 hover:bg-white hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Connect or Buy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant digital delivery for templates, or request due diligence and NDA for online businesses.
              </p>
            </div>

            {/* Step 4 */}
            <div className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-sky-200 hover:bg-white hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
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

      {/* 6. SELLER PROMOTION CTA BANNER */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-teal-400 text-xs font-semibold">
                <Rocket className="h-3.5 w-3.5" />
                <span>For Indian Developers, Studios & Founders</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Turn Your Code Into Recurring Income.
              </h2>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                Have you built side projects, production boilerplate repos, or turnkey websites? Monetize your digital assets with verified Indian buyers. Keep up to 88% of your revenue with automated payouts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button asChild size="lg" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg shadow-primary-600/25">
                <Link href="/sell">
                  <span>Start Selling on WebBazaar</span>
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
