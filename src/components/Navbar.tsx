import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isSellPage = location.pathname.startsWith('/sell');

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-[#2095D3] focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0]/85 bg-white/95 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:h-16 sm:px-8 lg:px-10">
          {/* Official arsouq Logo */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            aria-label="arsouq — Home"
            className="inline-flex items-center py-1 transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2095D3]"
          >
            <img
              src="/images/arsouq-logo-nav.png"
              alt="arsouq.com"
              width={118}
              height={43}
              className="h-7 w-auto object-contain sm:h-8.5"
            />
          </Link>

          {/* Minimal Center Navigation (Sell Phone nav item removed as requested) */}
          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className={`nav-link-underline text-xs font-semibold tracking-[0.08em] uppercase transition-colors hover:text-[#0F172A] ${
                location.pathname === '/' ? 'nav-link-active text-[#0F172A]' : 'text-[#64748B]'
              }`}
            >
              Home
            </Link>
            <a
              href={isSellPage ? '/#brands' : '#brands'}
              className="nav-link-underline text-xs font-semibold tracking-[0.08em] text-[#64748B] uppercase transition-colors hover:text-[#0F172A]"
            >
              Brands
            </a>
            <a
              href={isSellPage ? '/#process' : '#process'}
              className="nav-link-underline text-xs font-semibold tracking-[0.08em] text-[#64748B] uppercase transition-colors hover:text-[#0F172A]"
            >
              Process
            </a>
            <a
              href={isSellPage ? '/#standards' : '#standards'}
              className="nav-link-underline text-xs font-semibold tracking-[0.08em] text-[#64748B] uppercase transition-colors hover:text-[#0F172A]"
            >
              Standards
            </a>
          </nav>

          {/* Single Header Action */}
          <div className="flex items-center gap-2">
            {!isSellPage ? (
              <Link
                to="/sell"
                className="btn-press inline-flex items-center gap-1.5 rounded-full bg-[#2095D3] px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(32,149,211,0.22)] hover:bg-[#187BB2] sm:px-5"
              >
                <span>Sell Phone</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                to="/"
                className="btn-press inline-flex items-center rounded-full border border-[#CBD5E1] bg-white px-4 py-1.5 text-xs font-semibold text-[#0F172A] hover:border-[#2095D3] hover:text-[#2095D3]"
              >
                Home
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#0F172A] transition-colors hover:bg-slate-200/60 md:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <circle cx="6" cy="6" r="1.8" />
                  <circle cx="14" cy="6" r="1.8" />
                  <circle cx="6" cy="14" r="1.8" />
                  <circle cx="14" cy="14" r="1.8" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Clean Mobile Drawer (No duplicate Sell Phone link since CTA pill is in top bar) */}
        {menuOpen && (
          <div className="route-enter border-t border-[#E2E8F0] bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F6F8FB]"
              >
                Home
              </Link>
              <a
                href={isSellPage ? '/#brands' : '#brands'}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F6F8FB]"
              >
                Brands
              </a>
              <a
                href={isSellPage ? '/#process' : '#process'}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F6F8FB]"
              >
                Process
              </a>
              <a
                href={isSellPage ? '/#standards' : '#standards'}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F6F8FB]"
              >
                Standards
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
