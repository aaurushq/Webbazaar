"use client";

import * as React from "react";
import Link from "next/link";
import { Code2, ShieldCheck, FileCode, Sparkles } from "lucide-react";
import { DEMO_LISTINGS } from "@/data/demo-listings";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { ListingFilterState, Listing } from "@/types/marketplace";
import { filterAndSortListings } from "@/lib/utils";
import { ListingFilters } from "@/components/marketplace/ListingFilters";
import { getUnifiedMarketplaceListings } from "@/lib/listings/public";

export default function TemplatesPage() {
  const [templates, setTemplates] = React.useState<Listing[]>(
    DEMO_LISTINGS.filter((item) => item.listingType === "TEMPLATE").map(item => ({ ...item, isDemo: true }))
  );

  React.useEffect(() => {
    getUnifiedMarketplaceListings({ listingType: "TEMPLATE" }).then((items) => {
      setTemplates(items.filter((item) => item.listingType === "TEMPLATE"));
    });
  }, []);

  const [filters, setFilters] = React.useState<ListingFilterState>({
    searchQuery: "",
    listingType: "TEMPLATE",
    category: "ALL",
    sortBy: "newest",
    minPrice: undefined,
    maxPrice: undefined,
    techStack: [],
  });

  const filtered = React.useMemo(() => {
    return filterAndSortListings(templates, filters);
  }, [templates, filters]);

  const handleReset = () => {
    setFilters({
      searchQuery: "",
      listingType: "TEMPLATE",
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
        <span className="text-slate-900 font-semibold">Templates & Source Code</span>
      </nav>

      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-8 sm:p-10 mb-10 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
            <Code2 className="h-3.5 w-3.5 text-emerald-300" />
            <span>Developer Boilerplates & UI Kits</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Premium Templates & Clean Source Code
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            Kickstart your next Next.js 14, Tailwind, and React project with meticulously structured components, accessible patterns, and full commercial licenses.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-emerald-700/60 flex flex-wrap gap-6 text-xs text-emerald-200">
          <span className="flex items-center gap-1.5">
            <FileCode className="h-4 w-4 text-emerald-300" />
            Clean TypeScript Strict Mode
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Commercial Use License Included
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
