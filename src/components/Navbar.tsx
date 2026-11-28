import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, User, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isSellPage = location.pathname.startsWith('/sell');
  const isDashboardPage = location.pathname.startsWith('/dashboard');
  const isHomePage = location.pathname === '/';

  const handleProfileClick = () => {
    setMenuOpen(false);
    if (isDashboardPage) {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
      return;
    }
    navigate('/dashboard');
  };

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

          {/* Minimal Center Navigation */}
          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className={`nav-link-underline text-xs font-semibold tracking-[0.08em] uppercase transition-colors hover:text-[#0F172A] ${
                isHomePage ? 'nav-link-active text-[#0F172A]' : 'text-[#64748B]'
              }`}
            >
              Home
            </Link>
            <a
              href={!isHomePage ? '/#brands' : '#brands'}
              className="nav-link-underline text-xs font-semibold tracking-[0.08em] text-[#64748B] uppercase transition-colors hover:text-[#0F172A]"
            >
              Brands
            </a>
            <a
              href={!isHomePage ? '/#process' : '#process'}
              className="nav-link-underline text-xs font-semibold tracking-[0.08em] text-[#64748B] uppercase transition-colors hover:text-[#0F172A]"
            >
              Process
            </a>
            <a
              href={!isHomePage ? '/#standards' : '#standards'}
              className="nav-link-underline text-xs font-semibold tracking-[0.08em] text-[#64748B] uppercase transition-colors hover:text-[#0F172A]"
            >
              Standards
            </a>
          </nav>

          {/* Header Actions — Profile Icon on Top Right (replaces Home button on /sell) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {!isSellPage && (
              <Link
                to="/sell"
                onClick={() => setMenuOpen(false)}
                className="btn-press inline-flex h-9 items-center gap-1.5 rounded-full bg-[#2095D3] px-3.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(32,149,211,0.22)] hover:bg-[#187BB2] sm:h-9.5 sm:px-5"
              >
                <span>Sell Phone</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}

            {isHomePage && (
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
            )}

            <button
              type="button"
              onClick={handleProfileClick}
              aria-label={isDashboardPage ? 'Close user dashboard' : 'Open user dashboard'}
              aria-pressed={isDashboardPage}
              title="My Dashboard"
              className={`btn-press flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-full border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2095D3] sm:h-10 sm:w-10 ${
                isDashboardPage
                  ? 'border-[#2095D3] bg-[#2095D3] text-white shadow-[0_4px_12px_rgba(32,149,211,0.25)]'
                  : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] hover:border-[#2095D3] hover:bg-[#F0F8FD] hover:text-[#2095D3]'
              }`}
            >
              <User className="h-4.5 w-4.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            </button>
          </div>
        </div>

        {/* Clean Mobile Drawer on Home Page */}
        {menuOpen && isHomePage && (
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
                href="#brands"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F6F8FB]"
              >
                Brands
              </a>
              <a
                href="#process"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F6F8FB]"
              >
                Process
              </a>
              <a
                href="#standards"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F6F8FB]"
              >
                Standards
              </a>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#2095D3] hover:bg-[#F6F8FB]"
              >
                My Dashboard
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
