"use client";

import * as React from "react";
import Link from "next/link";
import { Wrench, Clock, RefreshCw, ShieldCheck, CheckCircle } from "lucide-react";
import { DEMO_LISTINGS } from "@/data/demo-listings";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { ListingFilterState, Listing } from "@/types/marketplace";
import { filterAndSortListings } from "@/lib/utils";
import { ListingFilters } from "@/components/marketplace/ListingFilters";
import { getUnifiedMarketplaceListings } from "@/lib/listings/public";

export default function ServicesPage() {
  const [services, setServices] = React.useState<Listing[]>(
    DEMO_LISTINGS.filter((item) => item.listingType === "SERVICE").map(item => ({ ...item, isDemo: true }))
  );

  React.useEffect(() => {
    getUnifiedMarketplaceListings({ listingType: "SERVICE" }).then((items) => {
      setServices(items.filter((item) => item.listingType === "SERVICE"));
    });
  }, []);

  const [filters, setFilters] = React.useState<ListingFilterState>({
    searchQuery: "",
    listingType: "SERVICE",
    category: "ALL",
    sortBy: "newest",
    minPrice: undefined,
    maxPrice: undefined,
    techStack: [],
  });

  const filtered = React.useMemo(() => {
    return filterAndSortListings(services, filters);
  }, [services, filters]);

  const handleReset = () => {
    setFilters({
      searchQuery: "",
      listingType: "SERVICE",
      category: "ALL",
      sortBy: "newest",
      minPrice: undefined,
      maxPrice: undefined,
      techStack: [],
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Website Customization & Services</span>
      </nav>

      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-950 to-slate-900 text-white p-8 sm:p-10 mb-10 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold">
            <Wrench className="h-3.5 w-3.5 text-sky-400" />
            <span>Expert Customization & Engineering Services</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Deploy, Rebrand & Customize with Verified Devs
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Need your new website rebranded, connected to your custom domain, or integrated with Indian payment gateways? Hire the original authors and verified developers with fixed-price protection.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-sky-400" />
            Guaranteed turnaround timelines
          </span>
          <span className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4 text-sky-400" />
            Revision cycles included
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Milestone approval before payout release
          </span>
        </div>
      </div>

      {/* Filter Component */}
      <div className="mb-8">
        <ListingFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleReset}
          totalResults={filtered.length}
        />
      </div>

      {/* Listings Grid */}
      <ListingGrid listings={filtered} onResetFilters={handleReset} />
    </div>
  );
}
