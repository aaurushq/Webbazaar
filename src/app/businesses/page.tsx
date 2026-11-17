"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, AlertTriangle, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { DEMO_LISTINGS } from "@/data/demo-listings";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { ListingFilterState } from "@/types/marketplace";
import { filterAndSortListings } from "@/lib/utils";
import { ListingFilters } from "@/components/marketplace/ListingFilters";

export default function BusinessesPage() {
  const businesses = React.useMemo(() => {
    return DEMO_LISTINGS.filter((item) => item.listingType === "BUSINESS");
  }, []);

  const [filters, setFilters] = React.useState<ListingFilterState>({
    searchQuery: "",
    listingType: "BUSINESS",
    category: "ALL",
    sortBy: "profit-desc",
    minPrice: undefined,
    maxPrice: undefined,
    techStack: [],
  });

  const filtered = React.useMemo(() => {
    return filterAndSortListings(businesses, filters);
  }, [businesses, filters]);

  const handleReset = () => {
    setFilters({
      searchQuery: "",
      listingType: "BUSINESS",
      category: "ALL",
      sortBy: "profit-desc",
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
        <span className="text-slate-900 font-semibold">Online Businesses for Sale</span>
      </nav>

      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950 to-slate-900 text-white p-8 sm:p-10 mb-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            <Briefcase className="h-3.5 w-3.5 text-amber-400" />
            <span>Digital Business Acquisitions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Acquire Cash-Flowing Online Businesses
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Profitable Indian micro-SaaS applications, content properties, and e-commerce stores available for direct acquisition.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-amber-400" />
            Mutual NDA & Private P&L Due Diligence
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Assisted Asset & Domain Transfer Workflow
          </span>
        </div>
      </div>

      {/* Mandatory Demo / Financial Disclaimer Banner */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-8 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">
            Phase 1 Due-Diligence & Demo Disclosure
          </p>
          <p className="text-amber-800 leading-relaxed">
            All financials, revenue multiples, and customer numbers displayed below are <strong>fictional sample representations</strong> for Phase 1 interface testing. In production (Phase 7), historical bank statements, payment provider readouts (Razorpay/Stripe), and traffic analytics (GA4) are verified independently before listing.
          </p>
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
