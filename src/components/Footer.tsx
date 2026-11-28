import React from 'react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B1120] text-white">
      <div className="mx-auto max-w-[1280px] px-4 pt-14 pb-10 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 md:grid-cols-12">
          {/* Brand Column (Duplicate Sell Phone button removed so only 1 closing button exists above footer) */}
          <div className="md:col-span-4">
            <Link to="/" aria-label="arsouq — Home" className="inline-block">
              <img
                src="/images/arsouq-logo-dark.png"
                alt="arsouq.com — online mobile store"
                width={150}
                height={71}
                loading="lazy"
                decoding="async"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="mt-3.5 max-w-xs text-sm leading-relaxed text-slate-400">
              Instant smartphone buyback valuations and doorstep pickup across the UAE.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8">
            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                Brands
              </h3>
              <ul className="mt-3.5 space-y-2 text-sm text-slate-300">
                <li>
                  <Link to="/sell?brand=apple" className="transition-colors hover:text-[#2095D3]">
                    Apple
                  </Link>
                </li>
                <li>
                  <Link to="/sell?brand=samsung" className="transition-colors hover:text-[#2095D3]">
                    Samsung
                  </Link>
                </li>
                <li>
                  <Link to="/sell?brand=google" className="transition-colors hover:text-[#2095D3]">
                    Google
                  </Link>
                </li>
                <li>
                  <Link to="/sell?brand=oneplus" className="transition-colors hover:text-[#2095D3]">
                    OnePlus
                  </Link>
                </li>
                <li>
                  <Link to="/sell?brand=xiaomi" className="transition-colors hover:text-[#2095D3]">
                    Xiaomi
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                Navigation
              </h3>
              <ul className="mt-3.5 space-y-2 text-sm text-slate-300">
                <li>
                  <a href="/#brands" className="transition-colors hover:text-[#2095D3]">
                    Supported Brands
                  </a>
                </li>
                <li>
                  <a href="/#process" className="transition-colors hover:text-[#2095D3]">
                    Selling Process
                  </a>
                </li>
                <li>
                  <a href="/#standards" className="transition-colors hover:text-[#2095D3]">
                    Standards
                  </a>
                </li>
                <li>
                  <a href="/#reviews" className="transition-colors hover:text-[#2095D3]">
                    Seller Feedback
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                UAE Service
              </h3>
              <ul className="mt-3.5 space-y-2 text-sm text-slate-400">
                <li>All 7 UAE Emirates</li>
                <li>UAE Bank IBAN · Cash · Wallet</li>
                <li>Certified Data Erasure</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-start justify-between gap-3 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {CURRENT_YEAR} arsouq.com — Online Mobile Store. All prices in AED.</p>
          <p>Brand names and marks belong to their respective owners.</p>
        </div>
      </div>
    </footer>
  );
};
