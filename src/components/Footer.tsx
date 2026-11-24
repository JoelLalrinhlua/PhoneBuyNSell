import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0A0C] text-white">
      <div className="mx-auto max-w-[1360px] px-5 pt-16 pb-12 sm:px-8 lg:px-12 lg:pt-20">
        {/* Top Footer Row */}
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link
              to="/"
              className="inline-block font-['Plus_Jakarta_Sans'] text-xl font-extrabold tracking-[-0.04em] text-white"
            >
              RagonBnS
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#A1A1AA]">
              Customer-facing smartphone buyback platform serving all seven Emirates in UAE Dirhams (AED).
            </p>
            <div className="mt-6">
              <Link
                to="/sell"
                className="btn-press inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#0A0A0C] hover:bg-[#E4E4E7]"
              >
                <span>Start Device Valuation</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-8">
            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.14em] text-[#71717A] uppercase">
                Brands
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-[#D4D4D8]">
                <li>
                  <Link to="/sell?brand=apple" className="transition-colors hover:text-white">
                    Sell Apple iPhone
                  </Link>
                </li>
                <li>
                  <Link to="/sell?brand=samsung" className="transition-colors hover:text-white">
                    Sell Samsung Galaxy
                  </Link>
                </li>
                <li>
                  <Link to="/sell?brand=google" className="transition-colors hover:text-white">
                    Sell Google Pixel
                  </Link>
                </li>
                <li>
                  <Link to="/sell?brand=oneplus" className="transition-colors hover:text-white">
                    Sell OnePlus
                  </Link>
                </li>
                <li>
                  <Link to="/sell?brand=xiaomi" className="transition-colors hover:text-white">
                    Sell Xiaomi
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.14em] text-[#71717A] uppercase">
                Experience
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-[#D4D4D8]">
                <li>
                  <Link to="/sell" className="transition-colors hover:text-white">
                    Device Configurator
                  </Link>
                </li>
                <li>
                  <a href="/#evaluation" className="transition-colors hover:text-white">
                    Grading Criteria
                  </a>
                </li>
                <li>
                  <a href="/#process" className="transition-colors hover:text-white">
                    How Selling Works
                  </a>
                </li>
                <li>
                  <a href="/#benefits" className="transition-colors hover:text-white">
                    Platform Benefits
                  </a>
                </li>
                <li>
                  <a href="/#reviews" className="transition-colors hover:text-white">
                    Seller Feedback
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.14em] text-[#71717A] uppercase">
                UAE Coverage
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-[#A1A1AA]">
                <li>Dubai</li>
                <li>Abu Dhabi</li>
                <li>Sharjah &amp; Ajman</li>
                <li>Ras Al Khaimah</li>
                <li>Fujairah &amp; UAQ</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.14em] text-[#71717A] uppercase">
                Settlement
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-[#A1A1AA]">
                <li>UAE Bank IBAN (AED)</li>
                <li>Instant Cash on Pickup</li>
                <li>Digital Wallet Payout</li>
                <li>Certified Data Erasure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal & Trademark Row */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 text-xs text-[#71717A] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} RagonBnS UAE. All valuations quoted in UAE Dirhams (AED).</p>
          <p>Product names and brand marks are trademarks of their respective owners.</p>
        </div>
      </div>
    </footer>
  );
};
