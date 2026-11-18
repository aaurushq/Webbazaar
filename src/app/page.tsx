"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Check,
  AppWindow,
  ShoppingBag,
  UtensilsCrossed,
  Building2,
  Compass,
  MessageSquare,
  SlidersHorizontal,
  Send,
  Eye,
  Users,
  Layers,
  IndianRupee,
  ExternalLink,
  RefreshCw,
  Globe,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HeroBrowserPreview,
  type HeroRealListingPreview,
} from "@/components/home/HeroBrowserPreview";
import { getPublicApprovedListingsAction } from "@/lib/listings/actions";
import { formatINR } from "@/lib/utils";

interface ApprovedListingItem {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  listing_type: string;
  category_id: string;
  price_inr: number;
  featured_image_path: string | null;
  demo_url: string | null;
  seller?: {
    id?: string;
    display_name?: string | null;
  } | null;
}

const PRIMARY_CATEGORIES = [
  {
    title: "SaaS & Web Apps",
    description:
      "Dashboards, client portals, booking tools, and full-stack web apps built to adapt.",
    href: "/marketplace?category=SaaS+%26+Web+Apps",
    icon: AppWindow,
    iconBg: "bg-[#F2F0FF] text-[#6257E8]",
  },
  {
    title: "E-Commerce Storefronts",
    description:
      "Product catalogs, brand storefronts, and D2C shopping experiences ready to customize.",
    href: "/marketplace?category=E-Commerce",
    icon: ShoppingBag,
    iconBg: "bg-[#F6EEFF] text-[#9B5DE5]",
  },
  {
    title: "Restaurants & Food",
    description:
      "Online menus, cloud kitchen ordering sites, and table booking websites.",
    href: "/marketplace?category=Restaurant+%26+Food",
    icon: UtensilsCrossed,
    iconBg: "bg-[#F2F0FF] text-[#6257E8]",
  },
  {
    title: "Real Estate & Portals",
    description:
      "Property listing directories, agent lead portals, and local marketplace websites.",
    href: "/marketplace?category=Real+Estate",
    icon: Building2,
    iconBg: "bg-[#F6EEFF] text-[#9B5DE5]",
  },
];

const SECONDARY_CATEGORIES = [
  { label: "Healthcare & Clinics", href: "/marketplace?category=Healthcare+%26+Wellness" },
  { label: "Education & Courses", href: "/marketplace?category=Education+%26+EdTech" },
  { label: "Agency & Portfolios", href: "/marketplace?category=Agency+%26+Portfolio" },
  { label: "Browse Ready Websites", href: "/ready-websites" },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Discover",
    description:
      "Browse ready-made websites and apps by category, tech stack, and INR budget. Explore live demos before reaching out.",
    icon: Compass,
  },
  {
    step: "02",
    title: "Connect",
    description:
      "Reach out directly to the independent developer who built the project to ask questions and review deliverables.",
    icon: MessageSquare,
  },
  {
    step: "03",
    title: "Customize",
    description:
      "Discuss brand styling, domain setup, or custom feature extensions tailored to your business goals.",
    icon: SlidersHorizontal,
  },
  {
    step: "04",
    title: "Deliver",
    description:
      "Arrange payment and code handover directly with the seller on mutually agreed terms and launch faster.",
    icon: Send,
  },
];

const BUYER_BENEFITS = [
  {
    title: "Preview Live Demos First",
    description:
      "Inspect working pages, layouts, and user flows before spending time or budget on a project.",
    icon: Eye,
  },
  {
    title: "Direct Seller Access",
    description:
      "Communicate directly with the developer who created the website or app — no agency layers.",
    icon: Users,
  },
  {
    title: "Built to Customize",
    description:
      "Start with a working foundation and adapt branding, pages, and workflows to match your vision.",
    icon: Layers,
  },
  {
    title: "Clear INR Pricing",
    description:
      "See transparent seller-set starting prices in Indian Rupees up front before starting a conversation.",
    icon: IndianRupee,
  },
];

function getReadableType(listingType: string): string {
  switch (listingType) {
    case "READY_WEBSITE":
      return "Ready Website";
    case "TEMPLATE":
      return "Web App / Template";
    case "BUSINESS":
      return "Online Business";
    case "SERVICE":
      return "Custom Service";
    default:
      return "Digital Project";
  }
}

export default function HomePage() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = React.useState("");
  const [approvedListings, setApprovedListings] = React.useState<ApprovedListingItem[]>([]);
  const [listingsState, setListingsState] = React.useState<"loading" | "ready" | "error">("loading");
  const [listingsError, setListingsError] = React.useState<string | null>(null);

  const loadApprovedListings = React.useCallback(async () => {
    setListingsState("loading");
    setListingsError(null);
    try {
      const result = await getPublicApprovedListingsAction({ limit: 6 });
      if (result.error) {
        setListingsError("We could not load marketplace listings right now.");
        setListingsState("error");
        return;
      }
      setApprovedListings((result.listings as ApprovedListingItem[]) || []);
      setListingsState("ready");
    } catch {
      setListingsError("We could not load marketplace listings right now.");
      setListingsState("error");
    }
  }, []);

  React.useEffect(() => {
    loadApprovedListings();
  }, [loadApprovedListings]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = heroSearch.trim();
    if (trimmed) {
      router.push(`/marketplace?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/marketplace");
    }
  };

  // Prefer a real approved listing that has an uploaded preview screenshot for the hero browser
  const heroRealListing: HeroRealListingPreview | null = React.useMemo(() => {
    const withImage = approvedListings.find(
      (item) => Boolean(item.featured_image_path && item.featured_image_path.trim().length > 0)
    );
    if (!withImage || !withImage.featured_image_path) return null;
    return {
      title: withImage.title,
      slug: withImage.slug,
      category: withImage.category_id,
      priceINR: Number(withImage.price_inr),
      previewImageUrl: withImage.featured_image_path,
      demoUrl: withImage.demo_url,
    };
  }, [approvedListings]);

  return (
    <div className="flex flex-col min-w-0 bg-white text-brand-dark">
      {/* ========================================================= */}
      {/* HERO SECTION — MANDATORY TWO-COLUMN WEBORA-INSPIRED SPLIT */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-brand-canvas border-b border-brand-border">
        {/* Soft editorial top-right radial highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-[520px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(98,87,232,0.12)_0%,rgba(155,93,229,0.06)_48%,transparent_75%)] blur-2xl"
        />

        <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,48fr)_minmax(0,52fr)] gap-10 lg:gap-12 items-center">
            {/* LEFT COLUMN (~48% on desktop) — Strictly left-aligned */}
            <div className="flex flex-col items-start text-left gap-6 min-w-0">
              {/* Announcement Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E0DDF8] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#5146D6] shadow-[0_2px_10px_-4px_rgba(98,87,232,0.18)]">
                <Sparkles className="size-3.5 text-[#6257E8] shrink-0" aria-hidden="true" />
                <span>Ready-Made Websites &amp; Apps Marketplace</span>
              </div>

              {/* Bold Editorial Left-Aligned Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-extrabold tracking-[-0.035em] leading-[1.06] text-brand-dark">
                Find a website.
                <span className="block mt-1 bg-gradient-to-r from-[#6257E8] to-[#9B5DE5] bg-clip-text text-transparent">
                  Make it yours.
                </span>
              </h1>

              {/* Supporting Paragraph */}
              <p className="text-base sm:text-lg text-[#4B526E] leading-relaxed max-w-[510px]">
                Discover ready-made websites and apps from independent developers. Preview live demos, connect with sellers, and customize your next project.
              </p>

              {/* Functional Hero Search Bar */}
              <form
                onSubmit={handleHeroSearch}
                role="search"
                aria-label="Search WebBazaar marketplace"
                className="w-full max-w-[540px] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-[#DCE0F5] bg-white p-2 shadow-[0_16px_40px_-14px_rgba(16,21,43,0.12)] focus-within:border-[#6257E8] focus-within:ring-4 focus-within:ring-[#6257E8]/10 transition-colors"
              >
                <div className="relative flex flex-1 items-center min-w-0">
                  <Search
                    className="pointer-events-none absolute left-3.5 size-4 text-[#7A819E]"
                    aria-hidden="true"
                  />
                  <input
                    data-testid="hero-search-input"
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search websites, apps, SaaS products..."
                    aria-label="Search websites, apps, SaaS products"
                    className="w-full h-11 pl-10 pr-3 text-sm text-brand-dark placeholder:text-[#8890AD] bg-transparent focus:outline-none"
                  />
                </div>
                <Button
                  data-testid="hero-search-submit"
                  type="submit"
                  size="lg"
                  className="bg-brand-primary hover:bg-primary-700 text-white font-semibold shrink-0 gap-1.5"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </form>

              {/* Subtle Genuine Benefit Indicators */}
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-medium text-[#525A78]">
                <li className="flex items-center gap-1.5">
                  <span className="flex size-4 items-center justify-center rounded-full bg-[#ECEAFE] text-[#6257E8]">
                    <Check className="size-2.5" aria-hidden="true" />
                  </span>
                  <span>Live demo previews</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="flex size-4 items-center justify-center rounded-full bg-[#ECEAFE] text-[#6257E8]">
                    <Check className="size-2.5" aria-hidden="true" />
                  </span>
                  <span>Direct seller contact</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="flex size-4 items-center justify-center rounded-full bg-[#ECEAFE] text-[#6257E8]">
                    <Check className="size-2.5" aria-hidden="true" />
                  </span>
                  <span>Customizable codebases</span>
                </li>
              </ul>
            </div>

            {/* RIGHT COLUMN (~52% on desktop) — Large Browser Product Preview */}
            <div className="w-full min-w-0">
              <HeroBrowserPreview realListing={heroRealListing} />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: EXPLORE WEBSITE & APP CATEGORIES               */}
      {/* ========================================================= */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                Browse by Category
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.025em] text-brand-dark">
                Explore Website &amp; App Categories
              </h2>
              <p className="text-sm text-[#58607D]">
                Find ready-made websites and web applications organized by business use case.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit border-brand-border text-brand-dark hover:bg-brand-canvas">
              <Link href="/marketplace" className="gap-1.5">
                <span>View Full Marketplace</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRIMARY_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.title}
                  href={category.href}
                  className="group block min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl"
                >
                  <Card className="h-full p-6 border-brand-border bg-white hover:border-[#C5C0FA] transition-colors flex flex-col justify-between gap-5">
                    <div className="flex flex-col gap-4">
                      <div
                        className={`flex size-11 items-center justify-center rounded-xl ${category.iconBg}`}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-base font-semibold tracking-tight text-brand-dark group-hover:text-brand-primary transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-[#58607D] leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary">
                      <span>Explore category</span>
                      <ArrowRight
                        className="size-3.5 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Secondary Category Quick Links */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="text-xs font-medium text-[#707896]">More categories:</span>
            {SECONDARY_CATEGORIES.map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className="rounded-full border border-brand-border bg-brand-canvas px-3.5 py-1.5 text-xs font-medium text-[#3C435E] hover:border-[#C5C0FA] hover:text-brand-primary transition-colors"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: FEATURED WEBSITES & APPS (REAL SUPABASE DATA)  */}
      {/* ========================================================= */}
      <section className="bg-brand-canvas border-y border-brand-border py-16 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                Marketplace Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.025em] text-brand-dark">
                Featured Websites &amp; Apps
              </h2>
              <p className="text-sm text-[#58607D]">
                Approved listings submitted by independent developers on WebBazaar.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit bg-white border-brand-border text-brand-dark hover:bg-primary-50">
              <Link href="/marketplace" className="gap-1.5">
                <span>Browse All Listings</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {/* Loading State */}
          {listingsState === "loading" && (
            <div
              role="status"
              aria-label="Loading featured websites and apps"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3].map((item) => (
                <Card key={item} className="overflow-hidden border-brand-border bg-white p-0">
                  <Skeleton className="aspect-[16/10] w-full rounded-none" />
                  <div className="p-5 flex flex-col gap-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {listingsState === "error" && (
            <Card
              role="alert"
              className="border-brand-border bg-white p-8 flex flex-col items-center text-center gap-4"
            >
              <p className="text-sm font-medium text-brand-dark">
                {listingsError || "Unable to load featured listings right now."}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={loadApprovedListings}
                className="gap-2"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                <span>Retry</span>
              </Button>
            </Card>
          )}

          {/* Empty State */}
          {listingsState === "ready" && approvedListings.length === 0 && (
            <Card className="border-brand-border bg-white p-10 flex flex-col items-center text-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#F2F0FF] text-brand-primary">
                <Globe className="size-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1 max-w-md">
                <h3 className="text-base font-semibold text-brand-dark">
                  New listings are being reviewed
                </h3>
                <p className="text-sm text-[#58607D]">
                  Explore the full catalog or submit your own ready-made website or app as a founding seller.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <Button asChild className="bg-brand-primary hover:bg-primary-700 text-white">
                  <Link href="/become-a-seller">Start Selling</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/marketplace">Explore Marketplace</Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Real Approved Listings Grid */}
          {listingsState === "ready" && approvedListings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="group overflow-hidden border-brand-border bg-white hover:border-[#C5C0FA] transition-colors flex flex-col justify-between"
                >
                  <div className="flex flex-col">
                    {/* Listing Visual Header */}
                    <Link
                      href={`/listings/${listing.slug}`}
                      className="relative block aspect-[16/10] w-full overflow-hidden bg-[#F2F3FC] border-b border-brand-border"
                    >
                      {listing.featured_image_path ? (
                        <Image
                          src={listing.featured_image_path}
                          alt={listing.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                        />
                      ) : (
                        /* Clean Honest Fallback Browser Preview when seller has not uploaded an image */
                        <div className="flex h-full w-full flex-col justify-between p-4 bg-gradient-to-br from-[#F7F8FF] via-white to-[#EFEBFD]">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1" aria-hidden="true">
                              <span className="size-2 rounded-full bg-[#FF605C]/70" />
                              <span className="size-2 rounded-full bg-[#FFBD44]/70" />
                              <span className="size-2 rounded-full bg-[#00CA4E]/70" />
                            </div>
                            <span className="rounded-full bg-white/95 border border-brand-border px-2.5 py-0.5 text-xs font-medium text-[#5146D6]">
                              {getReadableType(listing.listing_type)}
                            </span>
                          </div>
                          <div className="rounded-xl border border-brand-border bg-white/95 p-3.5 shadow-sm flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-brand-primary">
                                {listing.category_id}
                              </span>
                              {listing.demo_url && (
                                <span className="rounded-md bg-[#F4F3FF] px-2 py-0.5 text-[10px] font-semibold text-[#5146D6]">
                                  Live Demo Available
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5" aria-hidden="true">
                              <div className="h-2.5 w-3/4 rounded-full bg-[#E8E9F8]" />
                              <div className="h-2 w-1/2 rounded-full bg-[#F1F2FA]" />
                            </div>
                            {listing.demo_url && (
                              <span className="text-xs text-[#6B7290] truncate pt-0.5">
                                {listing.demo_url.replace(/^https?:\/\//, "")}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Link>

                    {/* Listing Details */}
                    <div className="p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-[#F2F0FF] px-2.5 py-0.5 text-xs font-medium text-[#5146D6]">
                          {listing.category_id}
                        </span>
                        <span className="text-xs font-medium text-[#646B88]">
                          {getReadableType(listing.listing_type)}
                        </span>
                      </div>

                      <Link href={`/listings/${listing.slug}`} className="flex flex-col gap-1.5">
                        <h3 className="text-base font-semibold tracking-tight text-brand-dark group-hover:text-brand-primary transition-colors line-clamp-2">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-[#58607D] line-clamp-2 leading-relaxed">
                          {listing.short_description}
                        </p>
                      </Link>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 pb-5 pt-4 border-t border-[#F0F1FA] flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#707896]">Listing price</span>
                      <span className="text-base font-bold text-brand-dark tabular-nums">
                        {formatINR(Number(listing.price_inr))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {listing.demo_url && (
                        <a
                          href={listing.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open live demo for ${listing.title}`}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-brand-border bg-white px-2.5 text-xs font-medium text-[#4B526E] hover:text-brand-primary hover:border-[#C5C0FA] transition-colors"
                        >
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      )}
                      <Button asChild size="sm" variant="outline" className="border-brand-border hover:border-[#C5C0FA] hover:text-brand-primary">
                        <Link href={`/listings/${listing.slug}`} className="gap-1">
                          <span>View Details</span>
                          <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Honest Seller Invitation Card when catalog has fewer than 3 approved listings */}
              {approvedListings.length < 3 && (
                <Card
                  className={`border-dashed border-2 border-[#D6D3F6] bg-white/90 p-6 sm:p-8 flex flex-col justify-between gap-6 ${
                    approvedListings.length === 1 ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="flex flex-col gap-4 max-w-xl">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#F2F0FF] text-brand-primary">
                      <Plus className="size-5" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                        Open for Independent Developers
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-brand-dark">
                        Publish your ready-made website or app on WebBazaar
                      </h3>
                      <p className="text-sm text-[#58607D] leading-relaxed">
                        Have a finished web app, SaaS starter, or niche business website? Submit your live demo and project specs for review so buyers can discover your work and reach out directly.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="rounded-xl bg-brand-canvas border border-brand-border p-3 flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-brand-dark">Share Live Demo</span>
                        <span className="text-xs text-[#646B88]">Let buyers test UX first</span>
                      </div>
                      <div className="rounded-xl bg-brand-canvas border border-brand-border p-3 flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-brand-dark">Direct Inquiries</span>
                        <span className="text-xs text-[#646B88]">Discuss scope directly</span>
                      </div>
                      <div className="rounded-xl bg-brand-canvas border border-brand-border p-3 flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-brand-dark">Set INR Pricing</span>
                        <span className="text-xs text-[#646B88]">Transparent listing rates</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button asChild className="bg-brand-primary hover:bg-primary-700 text-white font-semibold">
                      <Link href="/become-a-seller" className="gap-1.5">
                        <span>Start Selling</span>
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-brand-border">
                      <Link href="/marketplace">Explore Full Catalog</Link>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: HOW WEBBAZAAR WORKS                            */}
      {/* Discover -> Connect -> Customize -> Deliver               */}
      {/* ========================================================= */}
      <section id="how-it-works" className="bg-white py-16 sm:py-24 scroll-mt-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
              Simple Direct Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.025em] text-brand-dark">
              How WebBazaar Works
            </h2>
            <p className="text-sm text-[#58607D]">
              Discover ready-made projects, talk directly with their creators, customize to fit your brand, and coordinate delivery together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKFLOW_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.step}
                  className="p-6 border-brand-border bg-brand-canvas/60 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white border border-brand-border text-brand-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold tracking-wider text-[#8C84EC] tabular-nums">
                      STEP {item.step}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-semibold tracking-tight text-brand-dark">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#58607D] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: WHY BUY THROUGH WEBBAZAAR?                     */}
      {/* ========================================================= */}
      <section className="bg-brand-canvas border-t border-brand-border py-16 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
              Built for Practical Launches
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.025em] text-brand-dark">
              Why Buy Through WebBazaar?
            </h2>
            <p className="text-sm text-[#58607D]">
              A straightforward way for founders and businesses to find working websites and collaborate directly with independent developers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BUYER_BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={benefit.title}
                  className="p-6 border-brand-border bg-white flex flex-col gap-4"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#F2F0FF] text-brand-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-semibold tracking-tight text-brand-dark">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-[#58607D] leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: START SELLING CTA                              */}
      {/* ========================================================= */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-brand-dark px-6 py-12 sm:px-12 sm:py-16 text-white">
            {/* Subtle purple accent glow inside CTA card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-[radial-gradient(circle,rgba(98,87,232,0.45)_0%,rgba(155,93,229,0.2)_50%,transparent_75%)] blur-2xl"
            />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex flex-col gap-3 max-w-2xl">
                <span className="w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-[#C8C2FF]">
                  For Independent Developers &amp; Studios
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-[-0.03em] text-white leading-tight">
                  Have a website or app ready to share? Start selling on WebBazaar.
                </h2>
                <p className="text-sm sm:text-base text-[#B8BED9] leading-relaxed max-w-xl">
                  Showcase live demos of your websites and apps to founders looking for a faster launch. Connect with buyers directly and offer optional customization.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-primary hover:bg-primary-700 text-white font-semibold"
                >
                  <Link href="/become-a-seller" className="gap-2">
                    <span>Start Selling</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white hover:border-white/30"
                >
                  <Link href="/sell">For Sellers</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
