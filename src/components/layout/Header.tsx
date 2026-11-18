"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  LogOut,
  Globe,
  AppWindow,
  Compass,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/lib/auth/actions";

const NAV_LINKS = [
  { href: "/ready-websites", label: "Explore Websites", icon: Globe },
  { href: "/marketplace?category=SaaS+%26+Web+Apps", label: "Explore Apps", icon: AppWindow },
  { href: "/#how-it-works", label: "How It Works", icon: Compass },
  { href: "/sell", label: "For Sellers", icon: Store },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
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

  const isAdmin = userRoles.includes("ADMIN");
  const isSeller = userRoles.includes("VERIFIED_SELLER");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg"
        >
          <div
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6257E8] to-[#9B5DE5] text-white font-bold text-base shadow-[0_6px_16px_-4px_rgba(98,87,232,0.45)]"
          >
            W
          </div>
          <span className="font-bold text-xl tracking-[-0.03em] text-brand-dark">
            Web<span className="text-brand-primary">Bazaar</span>
          </span>
        </Link>

        {/* Focused Desktop Navigation */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href !== "/#how-it-works" &&
              (pathname === link.href ||
                (link.href.startsWith("/marketplace") && pathname === "/marketplace"));
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-brand-primary font-semibold"
                    : "text-[#4B526E] hover:text-brand-dark hover:bg-brand-canvas"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/buyer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-brand-canvas transition-colors text-xs font-semibold text-brand-dark"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                  {displayName?.charAt(0).toUpperCase() || "U"}
                </span>
                <span className="max-w-[110px] truncate">{displayName}</span>
              </Link>

              {isSeller && (
                <>
                  <Link
                    href="/dashboard/seller"
                    className="px-2.5 py-1.5 text-xs font-medium text-[#4B526E] hover:text-brand-dark rounded-lg hover:bg-brand-canvas transition-colors"
                  >
                    Seller
                  </Link>
                  <Link
                    href="/dashboard/seller/listings"
                    className="px-2.5 py-1.5 text-xs font-semibold text-brand-primary bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    Listings
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className="px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                >
                  Admin
                </Link>
              )}

              <form action={signOutAction}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  className="text-xs text-[#4B526E] hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-3.5 mr-1.5" aria-hidden="true" />
                  <span>Log Out</span>
                </Button>
              </form>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-2 text-sm font-medium text-[#373E58] hover:text-brand-dark transition-colors rounded-lg hover:bg-brand-canvas"
              >
                Log In
              </Link>
              <Button asChild className="bg-brand-primary hover:bg-primary-700 text-white font-semibold">
                <Link href="/become-a-seller" className="gap-1.5">
                  <span>Start Selling</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-brand-dark hover:bg-brand-canvas rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <Menu className="size-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-border bg-white px-4 py-4 flex flex-col gap-4">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-brand-dark hover:bg-brand-canvas rounded-lg transition-colors"
                >
                  <Icon className="size-4 text-brand-primary" aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-brand-border flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard/buyer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-brand-dark bg-brand-canvas rounded-lg"
                >
                  Account ({displayName})
                </Link>
                {isSeller && (
                  <Link
                    href="/dashboard/seller/listings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-semibold text-brand-primary bg-primary-50 rounded-lg"
                  >
                    Manage Seller Listings
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/dashboard/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-semibold text-amber-900 bg-amber-50 rounded-lg"
                  >
                    Admin Console
                  </Link>
                )}
                <form action={signOutAction} className="w-full">
                  <Button
                    variant="outline"
                    type="submit"
                    className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Log Out
                  </Button>
                </form>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild className="w-full bg-brand-primary hover:bg-primary-700 text-white">
                  <Link href="/become-a-seller" onClick={() => setMobileMenuOpen(false)}>
                    Start Selling
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
