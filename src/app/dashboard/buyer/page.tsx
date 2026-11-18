"use client";

import * as React from "react";
import Link from "next/link";
import {
  User,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileAction, signOutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { getMessagingDashboardStatsAction } from "@/lib/messaging/actions";
import type { MessagingDashboardStats } from "@/lib/messaging/types";

export default function BuyerDashboardPage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "purchases" | "wishlist" | "settings">(
    "overview"
  );
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [displayName, setDisplayName] = React.useState<string>("Loading...");
  const [phone, setPhone] = React.useState<string>("");
  const [userRoles, setUserRoles] = React.useState<string[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [statusMsg, setStatusMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
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

    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email || "");

          const [{ data: profile }, { data: roles }, msgRes] = await Promise.all([
            (supabase as any).from("profiles").select("*").eq("id", user.id).single(),
            (supabase as any).from("user_roles").select("role").eq("user_id", user.id),
            getMessagingDashboardStatsAction(),
          ]);

          if (profile) {
            setDisplayName(profile.display_name || user.email?.split("@")[0] || "User");
            setPhone(profile.phone || "");
          } else {
            setDisplayName(user.email?.split("@")[0] || "User");
          }

          if (roles) {
            setUserRoles(roles.map((r: any) => r.role));
          }

          if (msgRes.success) {
            setMessagingStats(msgRes.data);
          }
        }
      } catch (err) {
        console.error("Error fetching buyer profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    const result = await updateProfileAction({
      displayName,
      phone,
    });

    if (result?.error) {
      setStatusMsg({ type: "error", text: result.error });
    } else {
      setStatusMsg({ type: "success", text: "Profile details updated successfully in database!" });
    }
    setIsSaving(false);
  };

  const isVerifiedSeller = userRoles.includes("VERIFIED_SELLER");
  const isApplicant = userRoles.includes("SELLER_APPLICANT");

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      {/* Dashboard Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {displayName}
              </h1>
              <span className="rounded-md bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 font-semibold">
                Buyer Account
              </span>
              {isVerifiedSeller && (
                <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Seller
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {userEmail} • Connected to live Supabase Auth
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5 border-brand-border">
            <Link href="/dashboard/messages">
              <MessageSquare className="size-3.5 text-brand-primary" aria-hidden="true" />
              <span>Messages</span>
              {messagingStats.buyerUnreadCount > 0 && (
                <span className="rounded-full bg-brand-primary px-1.5 py-0.5 text-xs font-semibold text-white tabular-nums">
                  {messagingStats.buyerUnreadCount}
                </span>
              )}
            </Link>
          </Button>
          {isVerifiedSeller ? (
            <Button asChild size="sm" variant="default">
              <Link href="/dashboard/seller">Seller Dashboard</Link>
            </Button>
          ) : isApplicant ? (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              Seller Application Under Review
            </span>
          ) : (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/become-a-seller">
                <Sparkles className="h-3.5 w-3.5 text-primary-600" />
                <span>Apply to Sell</span>
              </Link>
            </Button>
          )}

          <form action={signOutAction}>
            <Button variant="ghost" size="sm" type="submit" className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: User },
          { id: "purchases", label: "Purchases & Downloads", icon: ShoppingBag },
          { id: "wishlist", label: "Saved Listings", icon: Heart },
          { id: "settings", label: "Profile & Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/dashboard/messages"
              className="rounded-xl border border-brand-border bg-white p-5 hover:border-[#C5C0FA] transition-colors flex flex-col gap-1"
            >
              <span className="text-xs font-medium text-[#58607D] uppercase">My Conversations</span>
              <p
                data-testid="buyer-conversations-count"
                className="text-2xl font-extrabold text-brand-dark tabular-nums"
              >
                {messagingStats.buyerConversationCount}
              </p>
              <span className="text-xs text-brand-primary font-medium">Open direct inbox →</span>
            </Link>
            <Link
              href="/dashboard/messages"
              className="rounded-xl border border-brand-border bg-white p-5 hover:border-[#C5C0FA] transition-colors flex flex-col gap-1"
            >
              <span className="text-xs font-medium text-[#58607D] uppercase">Unread Messages</span>
              <p
                data-testid="buyer-unread-count"
                className="text-2xl font-extrabold text-brand-primary tabular-nums"
              >
                {messagingStats.buyerUnreadCount}
              </p>
              <span className="text-xs text-[#646B88]">Replies awaiting your review</span>
            </Link>
            <div className="rounded-xl border border-brand-border bg-white p-5 flex flex-col gap-1">
              <span className="text-xs font-medium text-[#58607D] uppercase">Account Status</span>
              <p className="text-base font-bold text-brand-dark flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="size-4 text-brand-primary" aria-hidden="true" />
                <span>Authenticated Buyer</span>
              </p>
              <span className="text-xs text-[#646B88]">Connected to Supabase Auth</span>
            </div>
          </div>

          {/* My Conversations Live List */}
          <div className="rounded-2xl border border-brand-border bg-white p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-brand-primary" aria-hidden="true" />
                <h3 className="font-bold text-brand-dark text-sm">My Conversations</h3>
              </div>
              <Link
                href="/dashboard/messages"
                className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            {messagingStats.recentBuyerConversations.length === 0 ? (
              <div className="rounded-xl border border-brand-border bg-brand-canvas/60 p-6 text-center flex flex-col items-center gap-2.5">
                <p className="text-sm font-medium text-brand-dark">No seller conversations yet</p>
                <p className="text-xs text-[#58607D] max-w-md">
                  Browse approved websites and apps, preview live demos, and click Contact Seller to message creators directly.
                </p>
                <Button asChild size="sm" className="bg-brand-primary hover:bg-primary-700 text-white">
                  <Link href="/marketplace">Explore Available Websites</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[#F0F1FA]">
                {messagingStats.recentBuyerConversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/dashboard/messages/${conv.id}`}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-brand-canvas/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-brand-dark truncate">
                        {conv.listing?.title || "Marketplace Listing"}
                      </p>
                      <p className="text-xs text-[#58607D] truncate">
                        Seller: {conv.seller?.display_name || "Listing Seller"}
                        {conv.lastMessage ? ` • ${conv.lastMessage.body}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {conv.unreadCount > 0 && (
                        <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
                          {conv.unreadCount} new
                        </span>
                      )}
                      <span className="text-xs font-semibold text-brand-primary">Open →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Purchases */}
      {activeTab === "purchases" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
          <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No Purchases Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your purchased source code archives, license keys, and transfer receipts will appear here after payment integration (Phase 3).
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/marketplace">Browse Ready-Made Websites</Link>
          </Button>
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === "wishlist" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
          <Heart className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No Saved Listings</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any website, template, or online business card to bookmark it for later review.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/marketplace">Discover Products</Link>
          </Button>
        </div>
      )}

      {/* Tab 4: Profile & Settings */}
      {activeTab === "settings" && (
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Account Profile & Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your public display name and contact details stored in Supabase.
            </p>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                statusMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Read-only)
              </label>
              <Input
                type="email"
                value={userEmail}
                disabled
                className="bg-slate-50 text-slate-500 cursor-not-allowed text-xs h-9"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Your email is verified through Supabase Auth.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Display Name
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="text-xs h-9"
                placeholder="Your full name or organization"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="text-xs h-9"
              />
            </div>

            <Button type="submit" size="sm" disabled={isSaving || isLoadingProfile}>
              {isSaving ? "Saving..." : "Save Profile Details"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
