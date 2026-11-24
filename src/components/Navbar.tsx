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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-[#0A0A0C] focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 ${
          isSellPage
            ? 'border-[#E6E6E3] bg-white/95 backdrop-blur-md'
            : 'border-[#E3E2DC] bg-[#F0EFEA]/90 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* Clean Top-Left Website Name Wordmark (Logo icon removed) */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold tracking-[-0.04em] text-[#0A0A0C] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0C]"
          >
            RagonBnS
          </Link>

          {/* Center Minimal Nav Links */}
          <nav aria-label="Main navigation" className="hidden items-center gap-9 md:flex">
            <Link
              to="/"
              className={`nav-link-underline text-xs font-medium tracking-[0.12em] uppercase transition-colors hover:text-[#0A0A0C] ${
                location.pathname === '/' ? 'nav-link-active text-[#0A0A0C]' : 'text-[#52525B]'
              }`}
            >
              Home
            </Link>
            <a
              href={isSellPage ? '/#brands' : '#brands'}
              className="nav-link-underline text-xs font-medium tracking-[0.12em] text-[#52525B] uppercase transition-colors hover:text-[#0A0A0C]"
            >
              Brands
            </a>
            <a
              href={isSellPage ? '/#process' : '#process'}
              className="nav-link-underline text-xs font-medium tracking-[0.12em] text-[#52525B] uppercase transition-colors hover:text-[#0A0A0C]"
            >
              Process
            </a>
            <a
              href={isSellPage ? '/#benefits' : '#benefits'}
              className="nav-link-underline text-xs font-medium tracking-[0.12em] text-[#52525B] uppercase transition-colors hover:text-[#0A0A0C]"
            >
              Standards
            </a>
            <Link
              to="/sell"
              className={`nav-link-underline text-xs font-medium tracking-[0.12em] uppercase transition-colors hover:text-[#0A0A0C] ${
                isSellPage ? 'nav-link-active font-semibold text-[#0A0A0C]' : 'text-[#52525B]'
              }`}
            >
              Sell Phone
            </Link>
          </nav>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            {!isSellPage ? (
              <Link
                to="/sell"
                className="btn-press btn-sheen hidden items-center gap-1.5 rounded-full bg-[#0A0A0C] px-5 py-2 text-xs font-semibold text-white hover:bg-[#232326] sm:inline-flex"
              >
                <span>Sell Phone</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                to="/"
                className="btn-press hidden items-center gap-1.5 rounded-full border border-[#D8D8D4] bg-white px-4 py-2 text-xs font-medium text-[#0A0A0C] hover:border-[#0A0A0C] sm:inline-flex"
              >
                Home
              </Link>
            )}

            {/* Mobile 4-Dot Grid Button */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#0A0A0C] transition-colors hover:bg-black/5 md:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <circle cx="6" cy="6" r="2" />
                  <circle cx="14" cy="6" r="2" />
                  <circle cx="6" cy="14" r="2" />
                  <circle cx="14" cy="14" r="2" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Clean Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="route-enter border-t border-[#E5E4DF] bg-white px-5 pt-4 pb-6 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium text-[#0A0A0C] hover:bg-[#F5F5F3]"
              >
                Home
              </Link>
              <a
                href={isSellPage ? '/#brands' : '#brands'}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium text-[#0A0A0C] hover:bg-[#F5F5F3]"
              >
                Supported Brands
              </a>
              <a
                href={isSellPage ? '/#process' : '#process'}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium text-[#0A0A0C] hover:bg-[#F5F5F3]"
              >
                Selling Process
              </a>
              <a
                href={isSellPage ? '/#benefits' : '#benefits'}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium text-[#0A0A0C] hover:bg-[#F5F5F3]"
              >
                Platform Benefits
              </a>
              <div className="mt-3 flex items-center justify-end border-t border-[#ECECE9] pt-4">
                <Link
                  to="/sell"
                  onClick={() => setMenuOpen(false)}
                  className="btn-press inline-flex items-center gap-1.5 rounded-full bg-[#0A0A0C] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Sell Phone
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
