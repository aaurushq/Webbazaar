"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Download,
  MessageSquare,
  ShoppingCart,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building,
  Check,
  Share2,
} from "lucide-react";
import { DEMO_LISTINGS } from "@/data/demo-listings";
import { Listing } from "@/types/marketplace";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ContactSellerButton } from "@/components/messaging/ContactSellerButton";
import { formatINR, getListingTypeBadgeClass, getListingTypeLabel } from "@/lib/utils";
import { getUnifiedListingBySlug } from "@/lib/listings/public";

interface ListingDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const demoFallback = DEMO_LISTINGS.find((item) => item.slug === params.slug);
  const [listing, setListing] = React.useState<Listing | null>(demoFallback || null);
  const [loading, setLoading] = React.useState(!demoFallback);

  React.useEffect(() => {
    getUnifiedListingBySlug(params.slug).then((res) => {
      if (res) {
        setListing(res);
      }
      setLoading(false);
    });
  }, [params.slug]);

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [modalAction, setModalAction] = React.useState<
    "BUY_INSTANT" | "CONTACT_SELLER" | "REQUEST_NDA" | "LIVE_DEMO" | null
  >(null);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-xs text-slate-500">
        Loading listing details...
      </div>
    );
  }

  if (!listing) {
    notFound();
  }

  const allImages = [listing.previewImageUrl, ...(listing.galleryImages || [])];
  const isBusiness = listing.listingType === "BUSINESS";
  const isService = listing.listingType === "SERVICE";
  const isReadyWebsite = listing.listingType === "READY_WEBSITE";
  const isTemplate = listing.listingType === "TEMPLATE";

  const relatedListings = DEMO_LISTINGS.filter(
    (item) => item.id !== listing.id && (item.category === listing.category || item.listingType === listing.listingType)
  ).slice(0, 3);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-slate-500 mb-6 flex flex-wrap items-center gap-1.5">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/marketplace" className="hover:text-slate-900 transition-colors">
          Marketplace
        </Link>
        <span>/</span>
        <Link
          href={`/marketplace?type=${listing.listingType}`}
          className="hover:text-slate-900 transition-colors"
        >
          {getListingTypeLabel(listing.listingType)}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{listing.title}</span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column (Images, Descriptions, Detailed Specs) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Visual Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
              <Image
                src={allImages[activeImageIndex] || listing.previewImageUrl}
                alt={listing.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={getListingTypeBadgeClass(listing.listingType)}>
                  {getListingTypeLabel(listing.listingType)}
                </Badge>
                {listing.isDemo !== false ? (
                  <Badge variant="demo" className="bg-amber-900/80 text-amber-200 border-0">
                    DEMO DATA
                  </Badge>
                ) : (
                  <Badge variant="success" className="bg-emerald-700 text-white border-0 gap-1 font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> VERIFIED MERCHANT
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Row */}
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      activeImageIndex === idx
                        ? "border-primary-600 ring-2 ring-primary-100"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Category Header */}
          <div className="space-y-3 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-600">
              <span>{listing.category}</span>
              <span>•</span>
              <span className="text-slate-500">Listed in October 2024</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {listing.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {listing.shortDescription}
            </p>
          </div>

          {/* Type-Specific Metrics & Specs Showcase */}
          {/* Case A: ONLINE BUSINESS DEAL METRICS */}
          {isBusiness && listing.businessDetails && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-amber-700" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Business Financials & Deal Summary
                  </h3>
                </div>
                <Badge variant="demo" className="bg-amber-100 text-amber-900 border-amber-300">
                  {listing.businessDetails.dueDiligenceStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="rounded-xl bg-white p-3.5 border border-amber-100 shadow-xs">
                  <span className="text-[11px] text-slate-500 block mb-1">Monthly Net Profit</span>
                  <span className="text-lg font-bold text-emerald-700">
                    {formatINR(listing.businessDetails.monthlyNetProfitINR)}/mo
                  </span>
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-amber-100 shadow-xs">
                  <span className="text-[11px] text-slate-500 block mb-1">Annual Revenue (ARR)</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatINR(listing.businessDetails.annualRecurringRevenueINR)}
                  </span>
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-amber-100 shadow-xs">
                  <span className="text-[11px] text-slate-500 block mb-1">Profit Margin</span>
                  <span className="text-lg font-bold text-slate-900">
                    {listing.businessDetails.profitMarginPercent}%
                  </span>
                </div>
                <div className="rounded-xl bg-white p-3.5 border border-amber-100 shadow-xs">
                  <span className="text-[11px] text-slate-500 block mb-1">Multiple of Profit</span>
                  <span className="text-lg font-bold text-slate-900">
                    {listing.businessDetails.multipleOfProfit}x
                  </span>
                </div>
              </div>

              <div className="text-xs text-amber-900 bg-amber-100/60 p-3 rounded-lg border border-amber-200/60">
                <strong>Important Notice:</strong> Verified acquisition deals require buyer qualification and execution of a non-disclosure agreement (NDA) before access to private tax filings, Google Analytics dashboards, or code repositories is granted.
              </div>
            </div>
          )}

          {/* Case B: READY-MADE WEBSITE ASSETS */}
          {isReadyWebsite && listing.readyWebsiteDetails && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Included in this Turnkey Package</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {listing.readyWebsiteDetails.includedAssets.map((asset, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-800 font-medium">{asset}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-xs text-slate-500 flex items-center gap-4">
                <span>
                  Est. Cloud Hosting: <strong>~₹{listing.readyWebsiteDetails.monthlyHostingCostEstimateINR}/month</strong>
                </span>
                <span>•</span>
                <span>
                  Database: <strong>{listing.readyWebsiteDetails.databaseUsed}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Case C: TEMPLATE DETAILS */}
          {isTemplate && listing.templateDetails && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Template Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Framework</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {listing.templateDetails.framework}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Pre-built Pages</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {listing.templateDetails.includedPagesCount} Pages
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Commercial License</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {listing.templateDetails.licenseType}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Case D: CUSTOM SERVICE DETAILS */}
          {isService && listing.serviceDetails && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Service Scope & Deliverables</h3>
                <span className="text-xs font-semibold text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
                  {listing.serviceDetails.turnaroundDays}-Day Delivery • {listing.serviceDetails.revisionsIncluded} Revisions
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                {listing.serviceDetails.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-sky-100">
                    <Check className="h-4 w-4 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Overview Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">About this Product</h2>
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-3">
              <p>{listing.fullDescription}</p>
            </div>
          </div>

          {/* Technology Stack & Tags */}
          <div className="space-y-3 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Technology Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {listing.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800 border border-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar (Pricing, Checkout Action & Seller Info) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Purchase / Inquiry Action Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-6 lg:sticky lg:top-24">
            {/* Price Header */}
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <span className="text-xs text-slate-500 font-medium">
                {isBusiness ? "Asking Acquisition Price" : "One-Time Payment"}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {formatINR(listing.priceINR, isBusiness)}
                </span>
                {listing.originalPriceINR && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatINR(listing.originalPriceINR, isBusiness)}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 block">
                Prices in Indian Rupee (INR). Standard GST applicable.
              </span>
            </div>

            {/* Live Demo Preview Button (if applicable) */}
            {(listing.readyWebsiteDetails?.liveUrl || listing.templateDetails?.previewUrl) && (
              <Button
                variant="outline"
                className="w-full justify-center gap-2 h-11 text-xs font-semibold"
                onClick={() => setModalAction("LIVE_DEMO")}
              >
                <ExternalLink className="h-4 w-4 text-primary-600" />
                <span>Open Live Interactive Preview</span>
              </Button>
            )}

            {/* Primary Action: Contact Seller (Live Real-Time Messaging on Approved Listings) */}
            <div className="flex flex-col gap-3">
              <ContactSellerButton
                listingId={listing.id}
                listingSlug={listing.slug}
                sellerId={listing.seller.id}
                isDemo={listing.isDemo !== false}
                listingStatus="approved"
              />
            </div>

            {/* Direct MVP Info Checklist */}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-brand-primary shrink-0" aria-hidden="true" />
                <span>Direct buyer–seller communication via WebBazaar Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-brand-primary shrink-0" aria-hidden="true" />
                <span>Discuss customization, scope, and delivery terms directly</span>
              </div>
            </div>

            {/* Seller Profile Summary Card */}
            <div className="border-t border-slate-100 pt-5 mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                Created By Seller
              </span>
              <div className="flex items-start gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200">
                  <Image
                    src={listing.seller.avatarUrl}
                    alt={listing.seller.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {listing.seller.name}
                    </h4>
                    {listing.seller.isVerifiedDemo && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-slate-500 block mb-1">
                    {listing.seller.location} • Member since {listing.seller.memberSince}
                  </span>
                  <p className="text-xs text-slate-600 line-clamp-2">{listing.seller.bio}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedListings.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Similar Listings You Might Like</h3>
            <Button asChild variant="outline" size="sm">
              <Link href="/marketplace">View More</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedListings.map((rel) => (
              <ListingCard key={rel.id} listing={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Honest Interactive Action Modal (Phase Notice) */}
      <Dialog open={modalAction !== null} onOpenChange={(open) => !open && setModalAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-primary-600 mb-2">
              {modalAction === "REQUEST_NDA" ? (
                <FileText className="h-6 w-6 text-amber-600" />
              ) : modalAction === "CONTACT_SELLER" ? (
                <MessageSquare className="h-6 w-6 text-primary-600" />
              ) : (
                <ShoppingCart className="h-6 w-6 text-emerald-600" />
              )}
            </div>
            <DialogTitle className="text-center text-lg font-bold">
              {modalAction === "REQUEST_NDA"
                ? "Acquisition Workflow (Phase 7)"
                : modalAction === "CONTACT_SELLER"
                ? "Realtime Seller Messaging (Phase 5)"
                : modalAction === "LIVE_DEMO"
                ? "Sandboxed Live Demo"
                : "Digital Checkout & Downloads (Phase 6)"}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-600 pt-2 leading-relaxed">
              {modalAction === "REQUEST_NDA" && (
                <>
                  In Phase 7, requesting access to <strong>{listing.title}</strong> will trigger a legally binding mutual NDA signature, automated KYC identity verification, and access to a protected data room containing P&L filings and traffic analytics.
                </>
              )}
              {modalAction === "CONTACT_SELLER" && (
                <>
                  Direct messaging with verified seller <strong>{listing.seller.name}</strong> will be enabled in Phase 5 via Supabase Realtime chat with custom quote negotiation.
                </>
              )}
              {modalAction === "BUY_INSTANT" && (
                <>
                  Instant Razorpay checkout for <strong>{formatINR(listing.priceINR, isBusiness)}</strong> and automated signed download URL fulfillment for <strong>{listing.title}</strong> will be implemented in Phase 6.
                </>
              )}
              {modalAction === "LIVE_DEMO" && (
                <>
                  External preview demo links are isolated in sandboxed test environments to safeguard against untrusted script execution.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 border border-slate-200 mt-2">
            <span className="font-semibold text-slate-900 block mb-1">
              Current Phase Status:
            </span>
            <p className="text-slate-600">
              You are currently testing <strong>Phase 1 (Frontend & Catalog Architecture)</strong>. No fake payments, mock orders, or artificial checkout flows are simulated.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="default" onClick={() => setModalAction(null)}>
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
