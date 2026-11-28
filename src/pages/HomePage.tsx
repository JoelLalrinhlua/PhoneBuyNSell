import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  PlayCircle,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Star,
  Truck,
  Wallet,
} from 'lucide-react';
import { BRANDS, PHONE_MODELS } from '../data/catalog';
import { BrandLogo } from '../components/BrandLogo';
import { Reveal } from '../components/MotionPrimitives';
import { formatAed, getMaxModelPriceAed } from '../lib/valuationEngine';
import type { BrandId } from '../types/buyback';

const POPULAR_FILTER_TABS: { id: 'all' | BrandId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'apple', label: 'Apple' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'google', label: 'Google' },
  { id: 'oneplus', label: 'OnePlus' },
  { id: 'xiaomi', label: 'Xiaomi' },
];

const SELLING_STEPS = [
  {
    num: '01',
    icon: Smartphone,
    title: 'Brand, Model & Storage',
    desc: 'Select your manufacturer, exact phone model, and storage capacity.',
  },
  {
    num: '02',
    icon: SlidersHorizontal,
    title: 'Match Condition',
    desc: 'Pick Flawless or see transparent fixed AED adjustments upfront.',
  },
  {
    num: '03',
    icon: PlayCircle,
    title: 'Quick Inspection Guide',
    desc: 'Watch our 45-second check to confirm screen, battery, and parts.',
  },
  {
    num: '04',
    icon: Truck,
    title: 'Instant AED Evaluation',
    desc: 'Lock your 7-day Dirham offer and schedule free UAE pickup.',
  },
];

const PLATFORM_STANDARDS = [
  {
    title: 'Fixed AED Tier Pricing',
    desc: 'Clear upfront adjustments for scratches, genuine parts, or damage.',
  },
  {
    title: 'Certified Data Erasure',
    desc: 'Permanent factory wipe verified on every device collected.',
  },
  {
    title: 'Free Collection Across 7 Emirates',
    desc: 'Complimentary doorstep courier pickup and zero return fees.',
  },
  {
    title: 'Instant Dirham Settlement',
    desc: 'Paid on verification via UAE bank IBAN, digital wallet, or cash.',
  },
];

const SELLER_REVIEWS = [
  {
    id: 'rev-1',
    seller: 'Tariq A.',
    location: 'Dubai Marina',
    body: 'Selected my storage and condition in under a minute and received the exact quoted AED transfer at pickup.',
    deviceSold: 'iPhone 15 Pro Max · 256 GB',
    payoutAed: 3050,
    thumb: '/images/phone-pro-titanium.jpg',
  },
  {
    id: 'rev-2',
    seller: 'Noor M.',
    location: 'Abu Dhabi',
    body: 'Seeing the exact AED 150 small scratch adjustment upfront meant zero haggling when the courier arrived.',
    deviceSold: 'Galaxy S24 Ultra · 512 GB',
    payoutAed: 3220,
    thumb: '/images/phone-ultra-slate.jpg',
  },
  {
    id: 'rev-3',
    seller: 'Karim S.',
    location: 'Sharjah',
    body: 'Fast evaluation right on my phone, quick doorstep check, and instant UAE bank settlement.',
    deviceSold: 'Pixel 9 Pro XL · 256 GB',
    payoutAed: 2770,
    thumb: '/images/phone-bar-porcelain.jpg',
  },
];

export const HomePage: React.FC = () => {
  const [activeBrandFilter, setActiveBrandFilter] = useState<'all' | BrandId>('all');

  const displayedPopularModels = useMemo(() => {
    const filtered =
      activeBrandFilter === 'all'
        ? PHONE_MODELS.filter((m) => m.popular)
        : PHONE_MODELS.filter((m) => m.brandId === activeBrandFilter);
    return filtered.slice(0, 5);
  }, [activeBrandFilter]);

  return (
    <main id="main-content" className="route-enter">
      {/* =====================================================================
          1. CLEAN EDITORIAL HERO
             - Larger, stronger typography + structured key information cards
             - Phone shown freestanding directly on white ground (no box/card,
               compact & proportional size)
             - Only "Start Evaluating" and "How It Works" are clickable
         ===================================================================== */}
      <section
        data-enter=""
        className="relative overflow-hidden border-b border-[#E2E8F0] bg-white py-6 sm:py-12 lg:flex lg:min-h-[calc(100svh-4rem)] lg:max-h-[840px] lg:items-center lg:py-12"
      >
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-y-6 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8">
            {/* Top-Left Block (7 Cols on Desktop): Big Editorial Typography + Only 2 Clickable CTAs */}
            <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:self-end">
              <p className="hero-enter-1 font-mono text-[10.5px] font-semibold tracking-[0.11em] text-[#2095D3] uppercase sm:text-xs sm:tracking-[0.14em]">
                UAE Smartphone Buyback · Instant AED Offer
              </p>

              <h1 className="hero-enter-1 mt-2.5 font-['Plus_Jakarta_Sans'] text-[40px] leading-[1.03] font-extrabold tracking-[-0.035em] text-[#090D16] sm:mt-3 sm:text-[58px] lg:text-[66px] xl:text-[74px]">
                Sell your phone.
                <span className="mt-1 block text-[#2095D3]">Paid at your door.</span>
              </h1>

              <p className="hero-enter-2 mt-3 max-w-xl text-[15px] leading-relaxed text-[#475569] sm:mt-4 sm:text-lg">
                Get an accurate, fixed-tier Dirham offer in under a minute, with free courier collection and immediate payout anywhere in the UAE.
              </p>

              {/* The ONLY Two Clickable Controls in the Hero */}
              <div className="hero-enter-2 mt-5 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3.5">
                <Link
                  to="/sell"
                  className="btn-press inline-flex h-11 items-center gap-2 rounded-full bg-[#090D16] px-5 text-xs font-bold tracking-[0.04em] text-white uppercase shadow-[0_12px_28px_-8px_rgba(9,13,22,0.28)] hover:bg-[#2095D3] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#2095D3] sm:h-13 sm:gap-2.5 sm:px-8 sm:text-sm"
                >
                  <span>Start Evaluating</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#process"
                  className="btn-press inline-flex h-11 items-center rounded-full border border-[#CBD5E1] bg-white px-5 text-xs font-semibold text-[#090D16] hover:border-[#090D16] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#2095D3] sm:h-13 sm:px-7 sm:text-sm"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Right Column on Desktop / Center Visual on Mobile: JUST the Phone (no container component) */}
            <div className="hero-enter-3 flex items-center justify-center lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:justify-end lg:self-center">
              <img
                src="/images/hero-phone-isolated.jpg"
                alt="Flagship smartphones"
                width={551}
                height={680}
                fetchPriority="high"
                className="h-auto w-[180px] object-contain sm:w-[260px] lg:w-[355px] xl:w-[390px]"
              />
            </div>

            {/* Bottom-Left Block (7 Cols on Desktop): Important Information Components (Non-clickable) */}
            <div className="hero-enter-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:col-span-7 lg:col-start-1 lg:row-start-2 lg:self-start">
              <div className="flex items-center gap-3.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:block sm:p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EBF7FD] text-[#2095D3] sm:h-8 sm:w-8 sm:rounded-lg">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 sm:mt-2.5 sm:block">
                    <span className="font-mono text-[10.5px] font-bold text-[#187BB2] uppercase sm:block sm:text-[11px]">
                      7-Day Lock
                    </span>
                    <p className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-[#090D16] tabular-nums sm:mt-1 sm:text-base">
                      Up to AED 4,450
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs leading-snug text-[#64748B]">
                    Fixed condition tiers with zero hidden fees.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:block sm:p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EBF7FD] text-[#2095D3] sm:h-8 sm:w-8 sm:rounded-lg">
                  <Truck className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 sm:mt-2.5 sm:block">
                    <span className="font-mono text-[10.5px] font-bold text-[#187BB2] uppercase sm:block sm:text-[11px]">
                      Free Pickup
                    </span>
                    <p className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-[#090D16] sm:mt-1 sm:text-base">
                      All 7 Emirates
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs leading-snug text-[#64748B]">
                    Doorstep collection at your home or office.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:block sm:p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EBF7FD] text-[#2095D3] sm:h-8 sm:w-8 sm:rounded-lg">
                  <Wallet className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 sm:mt-2.5 sm:block">
                    <span className="font-mono text-[10.5px] font-bold text-[#187BB2] uppercase sm:block sm:text-[11px]">
                      Instant Pay
                    </span>
                    <span className="inline-flex items-center gap-1.5 sm:mt-1 sm:flex">
                      <span className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-[#090D16] sm:text-base">
                        IBAN · Cash
                      </span>
                      <ShieldCheck className="h-3.5 w-3.5 text-[#2095D3] sm:h-4 sm:w-4" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-snug text-[#64748B]">
                    On-the-spot payout &amp; certified data wipe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. SUPPORTED BRANDS (All 12 fit on 1 screen, zero duplicate links)
         ===================================================================== */}
      <section id="brands" className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <Reveal>
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
                Select your brand
              </h2>
              <p className="text-xs text-[#64748B] sm:text-sm">
                Tap a manufacturer to choose your model.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2.5 sm:mt-8 sm:grid-cols-4 sm:gap-3.5 lg:grid-cols-6">
              {BRANDS.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/sell?brand=${brand.id}`}
                  className="card-lift group flex h-[76px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-2 hover:border-[#2095D3] sm:h-24 sm:rounded-2xl sm:p-4"
                >
                  <BrandLogo
                    brandId={brand.id}
                    className={
                      brand.id === 'google' || brand.id === 'xiaomi'
                        ? 'h-7 w-7 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 sm:h-9 sm:w-9'
                        : 'h-5 max-w-[88px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 sm:h-6.5 sm:max-w-[116px]'
                    }
                  />
                  <span className="font-mono text-[9.5px] font-medium text-[#64748B] transition-colors group-hover:text-[#187BB2] sm:text-[10.5px]">
                    Up to {formatAed(brand.maxPayoutAed)}
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          3. POPULAR BUYBACK MODELS
         ===================================================================== */}
      <section className="border-y border-[#E2E8F0] bg-[#F6F8FB] py-14 sm:py-18 lg:py-22">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <Reveal>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
                Popular models
              </h2>

              <div className="flex flex-wrap gap-1.5 sm:gap-2" role="tablist" aria-label="Filter models">
                {POPULAR_FILTER_TABS.map((tab) => {
                  const active = activeBrandFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveBrandFilter(tab.id)}
                      className={`btn-press cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold sm:px-4 ${
                        active
                          ? 'bg-[#2095D3] text-white'
                          : 'border border-[#CBD5E1] bg-white text-[#64748B] hover:border-[#2095D3] hover:text-[#0F172A]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              key={activeBrandFilter}
              className="route-enter mt-8 grid grid-cols-2 gap-3.5 sm:mt-10 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5"
            >
              {displayedPopularModels.map((model) => {
                const maxPrice = getMaxModelPriceAed(model);
                const storageSummary = model.storageOptions.map((s) => s.capacity).join(' · ');
                return (
                  <Link
                    key={model.id}
                    to={`/sell?brand=${model.brandId}&model=${model.id}`}
                    className="card-lift group flex flex-col items-center rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center hover:border-[#2095D3] sm:p-5"
                  >
                    <div className="flex aspect-square w-full items-center justify-center overflow-hidden p-2">
                      <img
                        src={model.image}
                        alt={model.name}
                        width={260}
                        height={260}
                        loading="lazy"
                        decoding="async"
                        className="img-zoom h-full w-full object-contain"
                      />
                    </div>
                    <h3 className="mt-3 font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0F172A] sm:text-sm">
                      {model.name}
                    </h3>
                    {model.specBadge && (
                      <p className="mt-0.5 text-[10px] font-medium text-[#475569] sm:text-[11px]">
                        {model.specBadge}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] text-[#64748B]">{storageSummary}</p>
                    <p className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[#F0F8FD] px-3 py-1 font-mono text-[11px] font-bold text-[#187BB2] tabular-nums transition-colors group-hover:bg-[#2095D3] group-hover:text-white">
                      <span>Up to {formatAed(maxPrice)}</span>
                    </p>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          4. SELLING PROCESS (Clear, Structured 4-Step Flow, Minimal Text)
         ===================================================================== */}
      <section id="process" className="bg-white py-14 sm:py-18 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <Reveal>
            <div className="max-w-xl">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
                How selling works
              </h2>
              <p className="mt-1.5 text-sm text-[#64748B]">
                Four straightforward steps from device selection to instant payout.
              </p>
            </div>

            {/* Connected 4-Step Architectural Grid */}
            <div className="relative mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {/* Desktop Subtle Connecting Line */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-11 right-12 left-12 hidden h-px bg-[#E2E8F0] lg:block"
              />

              {SELLING_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.num}
                    className="relative flex items-start gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:flex-col sm:p-6"
                  >
                    <div className="relative z-10 flex items-center gap-3 sm:w-full sm:justify-between">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2095D3] font-mono text-xs font-bold text-white shadow-[0_4px_12px_rgba(32,149,211,0.22)]">
                        {step.num}
                      </span>
                      <span className="hidden h-9 w-9 items-center justify-center rounded-xl bg-[#F6F8FB] text-[#0F172A] sm:flex">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>

                    <div className="sm:mt-5">
                      <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0F172A]">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#64748B] sm:text-sm">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          5. STANDARDS & BENEFITS (Clean Asymmetric Split — Zero Duplicate CTA)
         ===================================================================== */}
      <section id="standards" className="border-y border-[#E2E8F0] bg-[#F6F8FB] py-14 sm:py-18 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <Reveal>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white sm:rounded-3xl lg:col-span-6">
                <img
                  src="/images/editorial-handover.jpg"
                  alt="Smartphone prepared for courier handover"
                  width={960}
                  height={717}
                  loading="lazy"
                  decoding="async"
                  className="h-[240px] w-full object-cover sm:h-[380px]"
                />
              </div>

              <div className="lg:col-span-6">
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
                  Platform standards
                </h2>
                <p className="mt-2 text-sm text-[#64748B]">
                  Transparent valuation rules and secure doorstep collection across the UAE.
                </p>

                <div className="mt-6 divide-y divide-[#E2E8F0] rounded-2xl border border-[#E2E8F0] bg-white px-5 sm:px-6">
                  {PLATFORM_STANDARDS.map((item) => (
                    <div key={item.title} className="flex items-start gap-3.5 py-4">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2095D3]" />
                      <div>
                        <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                          {item.title}
                        </h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#64748B]">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          6. SELLER FEEDBACK + THE SINGLE CLOSING SELL PHONE BUTTON
         ===================================================================== */}
      <section id="reviews" className="bg-white py-14 sm:py-18 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <Reveal>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
              Recent UAE sellers
            </h2>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:mt-9 sm:gap-6 md:grid-cols-3">
              {SELLER_REVIEWS.map((rev) => (
                <article
                  key={rev.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3.5">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#0F172A]">
                        {rev.seller}{' '}
                        <span className="font-normal text-[#64748B]">· {rev.location}</span>
                      </p>
                      <div
                        className="mt-1 flex items-center gap-0.5 text-[#2095D3]"
                        aria-label="5 out of 5 stars"
                      >
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="mt-2.5 text-xs leading-relaxed text-[#475569]">{rev.body}</p>
                    </div>

                    <img
                      src={rev.thumb}
                      alt={rev.deviceSold}
                      width={72}
                      height={72}
                      loading="lazy"
                      decoding="async"
                      className="h-16 w-16 shrink-0 rounded-xl border border-[#F1F5F9] bg-white object-contain p-1"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#F1F5F9] pt-3 text-xs">
                    <span className="font-medium text-[#64748B]">{rev.deviceSold}</span>
                    <span className="font-mono font-bold text-[#187BB2] tabular-nums">
                      {formatAed(rev.payoutAed)}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* Single Focused Closing CTA (Only 1 Sell Phone button near & below Standards) */}
            <div className="mt-14 rounded-3xl border border-[#E2E8F0] bg-[#F6F8FB] px-6 py-10 text-center sm:mt-18 sm:py-12">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
                Ready to check your phone&apos;s value?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs text-[#64748B] sm:text-sm">
                Select your device and condition in seconds to lock your 7-day AED offer.
              </p>
              <div className="mt-6">
                <Link
                  to="/sell"
                  className="btn-press inline-flex h-12 items-center gap-2 rounded-full bg-[#2095D3] px-8 text-xs font-bold tracking-[0.04em] text-white uppercase shadow-[0_8px_20px_rgba(32,149,211,0.24)] hover:bg-[#187BB2] sm:text-sm"
                >
                  <span>Sell Phone</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
};
