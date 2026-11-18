"use client";

import * as React from "react";
import Link from "next/link";
import {
  Store,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Package,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { getSellerDashboardStatsAction, getSellerListingsAction } from "@/lib/listings/actions";
import { getMessagingDashboardStatsAction } from "@/lib/messaging/actions";
import type { MessagingDashboardStats } from "@/lib/messaging/types";

export default function SellerDashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [sellerProfile, setSellerProfile] = React.useState<any>(null);
  const [application, setApplication] = React.useState<any>(null);
  const [stats, setStats] = React.useState({ total: 0, draft: 0, pending: 0, approved: 0, rejected: 0, archived: 0 });
  const [recentListings, setRecentListings] = React.useState<any[]>([]);
  const [messagingStats, setMessagingStats] = React.useState<MessagingDashboardStats>({
    buyerConversationCount: 0,
    buyerUnreadCount: 0,
    sellerInquiryCount: 0,
    sellerUnreadCount: 0,
    totalUnreadCount: 0,
    recentBuyerConversations: [],
    recentSellerInquiries: [],
  });

  React.useEffect(() => {
    const supabase = createClient();

    const fetchSellerData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Check approved seller profile
          const { data: profile } = await (supabase as any)
            .from("seller_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (profile) {
            setSellerProfile(profile);
            const [statsRes, listingsRes, msgRes] = await Promise.all([
              getSellerDashboardStatsAction(),
              getSellerListingsAction(),
              getMessagingDashboardStatsAction(),
            ]);
            if (statsRes.stats) setStats(statsRes.stats);
            if (listingsRes.listings) setRecentListings(listingsRes.listings.slice(0, 5));
            if (msgRes.success) setMessagingStats(msgRes.data);
          } else {
            // Check seller application status
            const { data: app } = await (supabase as any)
              .from("seller_applications")
              .select("*")
              .eq("user_id", user.id)
              .single();

            if (app) {
              setApplication(app);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching seller data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Loading seller dashboard...
      </div>
    );
  }

  // 1. Approved & Verified Seller State
  if (sellerProfile && sellerProfile.is_verified) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-sm">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {sellerProfile.store_name}
                </h1>
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Merchant
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Seller Handle: @{sellerProfile.handle} • {sellerProfile.country}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs border-brand-border">
              <Link href="/dashboard/messages">
                <MessageSquare className="size-4 text-brand-primary" aria-hidden="true" />
                <span>Buyer Inquiries</span>
                {messagingStats.sellerUnreadCount > 0 && (
                  <span className="rounded-full bg-brand-primary px-1.5 py-0.5 text-xs font-semibold text-white tabular-nums">
                    {messagingStats.sellerUnreadCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
              <Link href="/dashboard/seller/listings">
                <Package className="h-4 w-4" />
                <span>Manage Listings</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white">
              <Link href="/dashboard/seller/listings/new">
                <PlusCircle className="h-4 w-4" />
                <span>Create New Listing</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Real Database Messaging KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/messages"
            className="rounded-xl border border-brand-border bg-white p-5 hover:border-[#C5C0FA] transition-colors flex items-center justify-between gap-4"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-[#58607D] uppercase">Buyer Inquiries</span>
              <p
                data-testid="seller-inquiries-count"
                className="text-2xl font-extrabold text-brand-dark tabular-nums"
              >
                {messagingStats.sellerInquiryCount}
              </p>
              <span className="text-xs text-brand-primary font-medium">Open seller inbox →</span>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#F2F0FF] text-brand-primary shrink-0">
              <MessageSquare className="size-5" aria-hidden="true" />
            </div>
          </Link>

          <Link
            href="/dashboard/messages"
            className="rounded-xl border border-brand-border bg-white p-5 hover:border-[#C5C0FA] transition-colors flex items-center justify-between gap-4"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-[#58607D] uppercase">Unread Messages</span>
              <p
                data-testid="seller-unread-count"
                className="text-2xl font-extrabold text-brand-primary tabular-nums"
              >
                {messagingStats.sellerUnreadCount}
              </p>
              <span className="text-xs text-[#646B88]">Buyer messages waiting for a reply</span>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#F2F0FF] text-brand-primary shrink-0">
              <Clock className="size-5" aria-hidden="true" />
            </div>
          </Link>
        </div>

        {/* Real Database Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="text-xs font-medium text-slate-500 uppercase">Total Inventory</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
            <span className="text-[11px] text-slate-400">All registered listings</span>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
            <span className="text-xs font-medium text-emerald-700 uppercase">Live & Approved</span>
            <p className="text-2xl font-extrabold text-emerald-900 mt-1">{stats.approved}</p>
            <span className="text-[11px] text-emerald-600">Active on marketplace</span>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5">
            <span className="text-xs font-medium text-amber-700 uppercase">Pending Review</span>
            <p className="text-2xl font-extrabold text-amber-900 mt-1">{stats.pending}</p>
            <span className="text-[11px] text-amber-600">Under admin review</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="text-xs font-medium text-slate-500 uppercase">Drafts</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.draft}</p>
            <span className="text-[11px] text-slate-400">Unpublished drafts</span>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-5">
            <span className="text-xs font-medium text-red-700 uppercase">Action Needed</span>
            <p className="text-2xl font-extrabold text-red-900 mt-1">{stats.rejected}</p>
            <span className="text-[11px] text-red-600">Requires seller revisions</span>
          </div>
        </div>

        {/* Buyer Inquiries Live List */}
        <div className="rounded-2xl border border-brand-border bg-white p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-brand-primary" aria-hidden="true" />
              <h3 className="font-bold text-brand-dark text-sm">Recent Buyer Inquiries</h3>
            </div>
            <Link
              href="/dashboard/messages"
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>Open Inbox ({messagingStats.sellerInquiryCount})</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {messagingStats.recentSellerInquiries.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#646B88]">
              No buyer inquiries yet. Once buyers contact you on your approved listings, conversations will appear here.
            </div>
          ) : (
            <div className="divide-y divide-[#F0F1FA]">
              {messagingStats.recentSellerInquiries.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/dashboard/messages/${conv.id}`}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-brand-canvas/60 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-brand-dark truncate">
                      {conv.buyer?.display_name || "Interested Buyer"} — {conv.listing?.title || "Listing"}
                    </p>
                    <p className="text-xs text-[#58607D] truncate">
                      {conv.lastMessage ? conv.lastMessage.body : "Conversation started"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    {conv.unreadCount > 0 && (
                      <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
                        {conv.unreadCount} unread
                      </span>
                    )}
                    <span className="text-xs font-semibold text-brand-primary">Reply →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Listings Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Recent Listings</h3>
            <Link href="/dashboard/seller/listings" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all ({stats.total}) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentListings.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 space-y-2">
              <Package className="h-6 w-6 text-slate-400 mx-auto" />
              <p>No listings created yet.</p>
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/dashboard/seller/listings/new">Create First Listing</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentListings.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.listing_type.replace("_", " ")} • {item.category_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      ₹{item.price_inr.toLocaleString("en-IN")}
                    </span>
                    <Badge
                      variant={
                        item.status === "approved"
                          ? "success"
                          : item.status === "pending_review"
                          ? "warning"
                          : item.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Store Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Store Information</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {sellerProfile.bio || "No professional biography provided."}
          </p>
          {sellerProfile.portfolio_url && (
            <p className="text-xs text-primary-600">
              Portfolio:{" "}
              <a href={sellerProfile.portfolio_url} target="_blank" rel="noreferrer" className="underline">
                {sellerProfile.portfolio_url}
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  // 2. Pending Application State
  if (application && (application.status === "submitted" || application.status === "under_review")) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-8 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mx-auto">
            <Clock className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Application Under Review</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your seller application for <span className="font-semibold text-slate-900">&ldquo;{application.store_name}&rdquo;</span> has been received and is currently being evaluated by the WebBazaar trust and safety team.
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-amber-200/80 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Submitted:</span>
              <span className="font-medium text-slate-800">
                {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Seller Type:</span>
              <span className="font-medium text-slate-800 capitalize">{application.seller_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact:</span>
              <span className="font-medium text-slate-800">{application.contact_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-semibold text-amber-700 uppercase tracking-wide text-[11px]">
                {application.status}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Standard review SLA: 24 to 48 business hours. You will be notified via email once approved.
          </p>
        </div>
      </div>
    );
  }

  // 3. Rejected Application State
  if (application && application.status === "rejected") {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Seller Application Not Approved</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Reason: {application.rejection_reason || "Credentials did not meet current marketplace quality standards."}
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/become-a-seller">Submit Updated Application</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 4. Default: No application submitted
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl text-center space-y-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto">
        <Store className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Become a Verified Seller</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        WebBazaar operates as a verified-merchant-only marketplace. Submit your portfolio, developer background, or business credentials to begin listing.
      </p>
      <Button asChild size="sm">
        <Link href="/become-a-seller">Apply for Seller Account</Link>
      </Button>
    </div>
  );
}
