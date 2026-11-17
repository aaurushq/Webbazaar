"use client";

import * as React from "react";
import Link from "next/link";
import { Globe, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { DEMO_LISTINGS } from "@/data/demo-listings";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ListingFilterState } from "@/types/marketplace";
import { filterAndSortListings } from "@/lib/utils";
import { ListingFilters } from "@/components/marketplace/ListingFilters";

export default function ReadyWebsitesPage() {
  const readyWebsites = React.useMemo(() => {
    return DEMO_LISTINGS.filter((item) => item.listingType === "READY_WEBSITE");
  }, []);

  const [filters, setFilters] = React.useState<ListingFilterState>({
    searchQuery: "",
    listingType: "READY_WEBSITE",
    category: "ALL",
    sortBy: "newest",
    minPrice: undefined,
    maxPrice: undefined,
    techStack: [],
  });

  const filtered = React.useMemo(() => {
    return filterAndSortListings(readyWebsites, filters);
  }, [readyWebsites, filters]);

  const handleReset = () => {
    setFilters({
      searchQuery: "",
      listingType: "READY_WEBSITE",
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
        <span className="text-slate-900 font-semibold">Ready-Made Websites</span>
      </nav>

      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-8 sm:p-10 mb-10 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold">
            <Globe className="h-3.5 w-3.5 text-indigo-300" />
            <span>Turnkey Web Applications</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready-Made Websites for Indian Entrepreneurs
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            Skip months of development. Fully functional, responsive websites with database schemas, admin panels, and payment integrations ready for custom branding and instant launch.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-indigo-600/60 flex flex-wrap gap-6 text-xs text-indigo-200">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Source code & Git repo included
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-300" />
            Vercel & Supabase deployment guides
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
