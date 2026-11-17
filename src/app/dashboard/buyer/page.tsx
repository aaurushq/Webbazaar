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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileAction, signOutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";

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

  React.useEffect(() => {
    const supabase = createClient();

    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email || "");

          const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            setDisplayName(profile.display_name || user.email?.split("@")[0] || "User");
            setPhone(profile.phone || "");
          } else {
            setDisplayName(user.email?.split("@")[0] || "User");
          }

          const { data: roles } = await (supabase as any)
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);

          if (roles) {
            setUserRoles(roles.map((r: any) => r.role));
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-medium text-slate-500 uppercase">Total Purchases</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">0</p>
              <span className="text-[11px] text-slate-400">Phase 3: Digital Escrow Checkout</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-medium text-slate-500 uppercase">Active Inquiries</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">0</p>
              <span className="text-[11px] text-slate-400">Phase 4: Direct Messaging</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-xs font-medium text-slate-500 uppercase">Verification Status</span>
              <p className="text-base font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Email Verified
              </p>
              <span className="text-[11px] text-slate-400">Authenticated via Supabase</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Welcome to your WebBazaar Account</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are signed in as <span className="font-semibold text-slate-900">{userEmail}</span>. From this portal, you can explore marketplace offerings, apply to become an approved seller, and manage your account credentials.
            </p>
            <div className="pt-2">
              <Button asChild size="sm">
                <Link href="/marketplace">Explore Available Websites</Link>
              </Button>
            </div>
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
