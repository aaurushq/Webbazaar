import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-dark text-[#B8BED9] border-t border-white/10">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Summary */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6257E8] to-[#9B5DE5] text-white font-bold text-base"
              >
                W
              </div>
              <span className="font-bold text-xl tracking-[-0.03em] text-white">
                Web<span className="text-[#A8A0FF]">Bazaar</span>
              </span>
            </Link>
            <p className="text-sm text-[#9CA3C4] leading-relaxed max-w-sm">
              Discover ready-made websites and apps from independent developers. Preview live demos, connect directly with creators, and customize your next digital project.
            </p>
            <p className="text-xs text-[#7E86A8] leading-relaxed max-w-sm">
              WebBazaar is a discovery marketplace. Buyers and sellers discuss customization, pricing, payment, and code delivery directly.
            </p>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">
              Explore
            </p>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/ready-websites" className="hover:text-white transition-colors">
                  Explore Websites
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=SaaS+%26+Web+Apps" className="hover:text-white transition-colors">
                  Explore Apps
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Full Marketplace
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">
              Popular Categories
            </p>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/marketplace?category=SaaS+%26+Web+Apps" className="hover:text-white transition-colors">
                  SaaS &amp; Web Apps
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=E-Commerce" className="hover:text-white transition-colors">
                  E-Commerce Storefronts
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Restaurant+%26+Food" className="hover:text-white transition-colors">
                  Restaurants &amp; Food
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Real+Estate" className="hover:text-white transition-colors">
                  Real Estate Portals
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">
              Sellers
            </p>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/sell" className="hover:text-white transition-colors">
                  For Sellers
                </Link>
              </li>
              <li>
                <Link href="/become-a-seller" className="text-[#B6AEFF] hover:text-white font-medium transition-colors">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7E86A8]">
          <p>© {new Date().getFullYear()} WebBazaar. All rights reserved.</p>
          <p>Listing prices displayed in Indian Rupees (INR).</p>
        </div>
      </div>
    </footer>
  );
}
