"use client";

import * as React from "react";
import { Search, RotateCcw, Filter, ChevronDown, Check } from "lucide-react";
import { ListingFilterState, ListingType, Category, SortOption } from "@/types/marketplace";
import { CATEGORIES_LIST, POPULAR_TECH_STACKS } from "@/data/demo-listings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ListingFiltersProps {
  filters: ListingFilterState;
  onFilterChange: (newFilters: ListingFilterState) => void;
  onReset: () => void;
  totalResults: number;
}

const LISTING_TYPES: { label: string; value: ListingType | "ALL" }[] = [
  { label: "All Items", value: "ALL" },
  { label: "Ready Websites", value: "READY_WEBSITE" },
  { label: "Templates & Code", value: "TEMPLATE" },
  { label: "Online Businesses", value: "BUSINESS" },
  { label: "Custom Services", value: "SERVICE" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Featured First", value: "featured" },
  { label: "Highest Profit (Businesses)", value: "profit-desc" },
];

export function ListingFilters({
  filters,
  onFilterChange,
  onReset,
  totalResults,
}: ListingFiltersProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleTypeChange = (type: ListingType | "ALL") => {
    onFilterChange({ ...filters, listingType: type });
  };

  const handleCategoryChange = (cat: Category | "ALL") => {
    onFilterChange({ ...filters, category: cat });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value as SortOption });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
    onFilterChange({ ...filters, minPrice: val });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
    onFilterChange({ ...filters, maxPrice: val });
  };

  const toggleTech = (tech: string) => {
    const current = filters.techStack || [];
    const exists = current.includes(tech);
    const updated = exists ? current.filter((t) => t !== tech) : [...current, tech];
    onFilterChange({ ...filters, techStack: updated });
  };

  const isFiltered =
    filters.searchQuery !== "" ||
    (filters.listingType && filters.listingType !== "ALL") ||
    (filters.category && filters.category !== "ALL") ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    (filters.techStack && filters.techStack.length > 0) ||
    filters.sortBy !== "newest";

  return (
    <div className="space-y-4">
      {/* Search & Top Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search keywords, tech stack, business types..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="pl-10 h-11 text-sm bg-white"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            className="lg:hidden flex items-center gap-2 h-11 px-3 text-xs"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <Filter className="h-4 w-4 text-slate-500" />
            <span>Filters</span>
            {isFiltered && <span className="h-2 w-2 rounded-full bg-primary-600" />}
          </Button>

          {/* Sort Selector */}
          <div className="relative min-w-[180px]">
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="w-full h-11 appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-8 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          {/* Reset Action */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-slate-500 hover:text-slate-900 gap-1 h-11"
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Horizontal Listing Type Pill Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {LISTING_TYPES.map((type) => {
          const isSelected =
            filters.listingType === type.value || (!filters.listingType && type.value === "ALL");
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => handleTypeChange(type.value)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? "bg-slate-900 text-white shadow-sm font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Collapsible / Sidebar Details Filter (Desktop Sidebar or Mobile Overlay) */}
      <div
        className={`lg:block ${
          mobileFilterOpen ? "block" : "hidden"
        } rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-6`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Refine Catalog
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {totalResults} {totalResults === 1 ? "Listing" : "Listings"} Found
          </span>
        </div>

        {/* Category Pills */}
        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-2">Category</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleCategoryChange("ALL")}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                !filters.category || filters.category === "ALL"
                  ? "bg-primary-50 text-primary-700 border-primary-300 font-semibold"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Categories
            </button>
            {CATEGORIES_LIST.map((cat) => {
              const isSelected = filters.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                    isSelected
                      ? "bg-primary-50 text-primary-700 border-primary-300 font-semibold"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range Filter in INR */}
        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-2">
            Price Range (INR ₹)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 block mb-1">Min (₹)</span>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice ?? ""}
                onChange={handleMinPriceChange}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-1">Max (₹)</span>
              <Input
                type="number"
                placeholder="No limit"
                value={filters.maxPrice ?? ""}
                onChange={handleMaxPriceChange}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Tech Stack Filter */}
        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-2">
            Technology Stack
          </label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TECH_STACKS.map((tech) => {
              const isSelected = filters.techStack?.includes(tech);
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTech(tech)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                    isSelected
                      ? "bg-slate-800 text-white border-slate-800 font-medium"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  <span>{tech}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
