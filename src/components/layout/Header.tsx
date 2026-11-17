"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Globe,
  Code2,
  Briefcase,
  Wrench,
  Sparkles,
  ArrowRight,
  User,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/lib/auth/actions";

const NAV_LINKS = [
  { href: "/ready-websites", label: "Ready Websites", icon: Globe },
  { href: "/templates", label: "Templates & Code", icon: Code2 },
  { href: "/businesses", label: "Businesses for Sale", icon: Briefcase },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/marketplace", label: "Explore All", icon: Sparkles },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [user, setUser] = React.useState<{ id: string; email?: string } | null>(null);
  const [userRoles, setUserRoles] = React.useState<string[]>([]);
  const [displayName, setDisplayName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email });

        // Fetch user profile display name
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("display_name")
          .eq("id", authUser.id)
          .single();

        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        } else {
          setDisplayName(authUser.email?.split("@")[0] || "Account");
        }

        // Fetch user roles
        const { data: roles } = await (supabase as any)
          .from("user_roles")
          .select("role")
          .eq("user_id", authUser.id);

        if (roles) {
          setUserRoles(roles.map((r: any) => r.role));
        }
      } else {
        setUser(null);
        setDisplayName(null);
        setUserRoles([]);
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        fetchUser();
      } else {
        setUser(null);
        setDisplayName(null);
        setUserRoles([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isAdmin = userRoles.includes("ADMIN");
  const isSeller = userRoles.includes("VERIFIED_SELLER");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 glass-header shadow-xs transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo with Ambient Glow */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-primary-600 to-teal-500 text-white font-extrabold text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            W
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none group-hover:text-primary-600 transition-colors">
              Web<span className="text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-teal-600">Bazaar</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Digital Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-semibold">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all",
                  isActive
                    ? "bg-primary-50 text-primary-700 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/70"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Quick Search */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs lg:max-w-sm justify-end">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search websites, code, SaaS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-12 text-xs rounded-lg border border-slate-200/90 bg-slate-50/80 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
              ⌘K
            </kbd>
          </form>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/buyer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-semibold text-slate-800 shadow-xs"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-primary-600 text-[10px] font-bold text-white shadow-xs">
                  {displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="max-w-[100px] truncate">{displayName}</span>
              </Link>

              {isSeller && (
                <>
                  <Link
                    href="/dashboard/seller"
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                    title="Seller Dashboard"
                  >
                    Seller
                  </Link>
                  <Link
                    href="/dashboard/seller/listings"
                    className="px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
                    title="Manage Listings"
                  >
                    Listings
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200/70 transition-colors"
                  title="Admin Console"
                >
                  Admin
                </Link>
              )}

              <form action={signOutAction}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  <span>Logout</span>
                </Button>
              </form>
            </div>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900">
                <Link href="/login">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>Log In</span>
                </Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="gap-1.5 text-xs bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all"
              >
                <Link href="/become-a-seller">
                  <span>Become a Seller</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-4 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search websites, code, SaaS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50"
            />
          </form>

          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard/buyer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-800 bg-slate-50 rounded-lg"
                >
                  <span>Dashboard ({displayName})</span>
                  <LayoutDashboard className="h-4 w-4 text-slate-500" />
                </Link>
                {isAdmin && (
                  <Link
                    href="/dashboard/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-amber-800 bg-amber-50 rounded-lg"
                  >
                    <span>Admin Console</span>
                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                  </Link>
                )}
                <form action={signOutAction} className="w-full">
                  <Button variant="outline" size="sm" type="submit" className="w-full text-red-600 border-red-200">
                    <LogOut className="h-4 w-4 mr-1.5" />
                    <span>Sign Out</span>
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="w-full justify-center">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild size="sm" className="w-full justify-center">
                  <Link href="/become-a-seller" onClick={() => setMobileMenuOpen(false)}>
                    Become a Seller
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
