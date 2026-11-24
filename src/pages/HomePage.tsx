import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
  CheckCircle2,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { BRANDS, PHONE_MODELS } from '../data/catalog';
import { BrandLogo } from '../components/BrandLogo';
import { Reveal } from '../components/MotionPrimitives';
import { formatAed, getMaxModelPriceAed } from '../lib/valuationEngine';
import type { BrandId } from '../types/buyback';

const HERO_STEP_LABELS = ['01 Brand', '02 Model', '03 Storage', '04 Condition', '05 AED Offer'];

const POPULAR_FILTER_TABS: { id: 'all' | BrandId; label: string }[] = [
  { id: 'all', label: 'All Flagships' },
  { id: 'apple', label: 'Apple' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'google', label: 'Google' },
  { id: 'oneplus', label: 'OnePlus' },
  { id: 'xiaomi', label: 'Xiaomi' },
];

const SELLER_REVIEWS = [
  {
    id: 'rev-1',
    seller: 'Tariq A.',
    location: 'Dubai Marina',
    heading: 'Exact AED estimate paid at handover',
    body: 'Selected my storage and condition in two minutes. The courier checked battery health at the door and transferred the exact quoted amount.',
    deviceSold: 'iPhone 15 Pro Max · 256 GB',
    payoutAed: 2980,
    thumb: '/images/phone-pro-titanium.jpg',
  },
  {
    id: 'rev-2',
    seller: 'Noor M.',
    location: 'Al Reem Island, Abu Dhabi',
    heading: 'Structured like buying a new phone',
    body: 'No haggling or marketplace messages. The condition steps made it clear why my device qualified for flawless pricing before scheduling pickup.',
    deviceSold: 'Galaxy S24 Ultra · 512 GB',
    payoutAed: 3330,
    thumb: '/images/phone-ultra-slate.jpg',
  },
  {
    id: 'rev-3',
    seller: 'Karim S.',
    location: 'Aljada, Sharjah',
    heading: 'Clean data wipe and fast bank transfer',
    body: 'Appreciated seeing the breakdown for my minor screen wear upfront so there were zero surprises during device verification.',
    deviceSold: 'Pixel 9 Pro XL · 256 GB',
    payoutAed: 2540,
    thumb: '/images/phone-bar-porcelain.jpg',
  },
];

export const HomePage: React.FC = () => {
  const [activeBrandFilter, setActiveBrandFilter] = useState<'all' | BrandId>('all');
  const [activeHeroStep, setActiveHeroStep] = useState(0);

  useEffect(() => {
    const stepTimer = window.setInterval(() => {
      setActiveHeroStep((prev) => (prev + 1) % HERO_STEP_LABELS.length);
    }, 2000);
    return () => window.clearInterval(stepTimer);
  }, []);

  const displayedPopularModels = React.useMemo(() => {
    const filtered =
      activeBrandFilter === 'all'
        ? PHONE_MODELS.filter((m) => m.popular)
        : PHONE_MODELS.filter((m) => m.brandId === activeBrandFilter);
    return filtered.slice(0, 5);
  }, [activeBrandFilter]);

  return (
    <div id="main-content" className="route-enter">
      {/* =====================================================================
          1. CLEAN, FULL-VIEWPORT STUDIO HERO (True Reference 1 3-Column Stage)
         ===================================================================== */}
      <section className="relative overflow-hidden bg-[#F0EFEA] pt-6 pb-0 lg:h-[calc(100svh-4rem)] lg:min-h-[600px] lg:max-h-[860px] lg:pt-8">
        <div className="relative z-10 mx-auto h-full w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-6">
            {/* Left Flanking Column (Cols 1-3 — Spans top-to-bottom alongside headline & phones) */}
            <div className="hero-left-col order-2 flex flex-col justify-between gap-4 pb-8 lg:order-1 lg:col-span-3 lg:pt-4 lg:pb-10">
              <div className="flex flex-col gap-4">
                {/* Step-by-Step Card */}
                <div className="float-gentle">
                  <Link
                    to="/sell"
                    className="card-lift group block rounded-2xl border border-[#E2E1DC] bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.03)]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-['Plus_Jakarta_Sans'] text-sm leading-snug font-semibold text-[#0A0A0C]">
                          Configured
                          <br />
                          step by step.
                        </p>
                        <p className="mt-1 font-mono text-[11px] font-medium text-[#059669]">
                          {HERO_STEP_LABELS[activeHeroStep]}
                        </p>
                      </div>
                      <span className="mt-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D4D4D0] text-[#0A0A0C] transition-all duration-300 group-hover:rotate-45 group-hover:border-[#0A0A0C] group-hover:bg-[#0A0A0C] group-hover:text-white">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>

                    <div className="mt-3.5 grid grid-cols-5 gap-1" aria-hidden="true">
                      {HERO_STEP_LABELS.map((lbl, idx) => (
                        <span
                          key={lbl}
                          className={`h-1 rounded-full transition-all duration-500 ${idx <= activeHeroStep ? 'bg-[#0A0A0C]' : 'bg-[#ECECE8]'
                            }`}
                        />
                      ))}
                    </div>
                  </Link>
                </div>

                {/* Dark Hardware Preview Tile */}
                <Link
                  to="/sell"
                  className="card-lift group relative h-32 overflow-hidden rounded-2xl bg-[#0A0A0C] shadow-[0_8px_24px_rgba(0,0,0,0.07)] xl:h-36"
                  aria-label="Start phone evaluation"
                >
                  <img
                    src="/images/macro-frame-dark.jpg"
                    alt="Brushed titanium smartphone frame macro detail"
                    className="img-zoom h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0A0A0C] shadow-md transition-transform duration-300 group-hover:scale-110">
                      <SlidersHorizontal className="h-4 w-4" />
                    </span>
                  </div>
                </Link>

                <p className="pt-1 text-xs leading-relaxed text-[#52525B] xl:text-[13px]">
                  Select your device, confirm its condition, and schedule free courier handover anywhere in the UAE.
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <Link
                  to="/sell"
                  className="btn-press btn-sheen inline-flex h-12 items-center justify-center rounded-full bg-[#0A0A0C] px-7 text-xs font-semibold tracking-[0.01em] text-white shadow-[0_8px_20px_rgba(10,10,12,0.15)] hover:bg-[#232326]"
                >
                  Sell Your Phone
                </Link>
                <Link
                  to="/sell"
                  aria-label="Open phone valuation configurator"
                  className="btn-press group flex h-12 w-12 items-center justify-center rounded-full border border-[#C8C8C4] bg-white/80 text-[#0A0A0C] hover:border-[#0A0A0C] hover:bg-white"
                >
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>

            {/* Center Column (Cols 4-9 — Headline at top + Commanding Phones immediately beneath) */}
            <div className="order-1 flex flex-col items-center justify-between lg:order-2 lg:col-span-6 lg:min-h-0">
              <div className="relative z-20 text-center lg:pt-1">
                <h1 className="hero-stagger-1 font-['Plus_Jakarta_Sans'] text-5xl leading-[0.96] font-extrabold tracking-[-0.045em] text-[#0A0A0C] sm:text-6xl lg:text-[68px] xl:text-[78px]">
                  Sell your phone.
                </h1>
                <p className="hero-stagger-2 mt-2.5 text-sm font-normal text-[#3F3F46] sm:text-base xl:text-lg">
                  Instant AED valuation and complimentary pickup across the UAE.
                </p>
              </div>

              <div className="hero-phone-stage relative mt-2 flex w-full flex-1 items-end justify-center overflow-hidden lg:-mt-6 lg:min-h-0">
                <img
                  src="/images/hero-phones.jpg"
                  alt="Flagship titanium smartphones standing upright on a natural stone plinth"
                  style={{
                    WebkitMaskImage:
                      'linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%)',
                    maskImage:
                      'linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%)',
                  }}
                  className="h-full max-h-[420px] w-full object-contain object-bottom transition-transform duration-700 hover:scale-[1.015] sm:max-h-[480px] lg:max-h-full"
                />
              </div>
            </div>

            {/* Right Flanking Column (Cols 10-12 — Spans top-to-bottom alongside headline & phones) */}
            <div className="hero-right-col order-3 flex flex-col justify-between gap-4 pb-10 lg:col-span-3 lg:items-end lg:pt-4 lg:pb-10">
              <div className="flex w-full flex-col gap-4 lg:items-end">
                <div className="float-gentle-delayed w-full lg:max-w-[230px]">
                  <div className="card-lift rounded-2xl border border-[#E2E1DC] bg-white/92 p-5 shadow-[0_6px_24px_rgba(0,0,0,0.03)]">
                    <ShieldCheck className="h-5 w-5 text-[#0A0A0C]" strokeWidth={1.75} />
                    <p className="mt-3 font-['Plus_Jakarta_Sans'] text-sm leading-snug font-semibold text-[#0A0A0C]">
                      Certified data erasure.
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#71717A]">
                      Permanent factory wipe verified on every device.
                    </p>
                  </div>
                </div>

                <div className="float-gentle w-full lg:max-w-[230px]">
                  <div className="card-lift rounded-2xl border border-[#E2E1DC] bg-white/92 p-5 shadow-[0_6px_24px_rgba(0,0,0,0.03)]">
                    <p className="font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.03em] text-[#0A0A0C] tabular-nums">
                      100%
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#0A0A0C]">7-Day Price Lock.</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#71717A]">
                      Your quoted AED offer stays fixed until collection.
                    </p>
                  </div>
                </div>
              </div>

              {/* Circular + Anchor Trigger */}
              <div className="flex items-center gap-3 pt-2 lg:w-full lg:max-w-[230px] lg:flex-col lg:items-center">
                <a
                  href="#process"
                  aria-label="Scroll to how selling works"
                  className="btn-press group flex h-15 w-15 items-center justify-center rounded-full border border-[#D4D4D0] bg-white text-[#0A0A0C] shadow-[0_4px_14px_rgba(0,0,0,0.03)] hover:border-[#0A0A0C] hover:bg-[#0A0A0C] hover:text-white"
                >
                  <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" strokeWidth={1.75} />
                </a>
                <span className="text-xs font-semibold text-[#0A0A0C]">How Selling Works</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. HARDWARE EVALUATION EDITORIAL CARDS
         ===================================================================== */}
      <section id="evaluation" className="border-t border-[#E6E5E0] bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h2 className="font-['Plus_Jakarta_Sans'] text-4xl leading-[1.05] font-bold tracking-[-0.04em] text-[#0A0A0C] sm:text-5xl lg:text-[62px]">
                  Valuation.
                  <br />
                  In every <span className="text-[#8E8E93]">detail.</span>
                </h2>
              </div>
              <div className="flex flex-col items-start gap-5 lg:col-span-5 lg:pl-8">
                <p className="max-w-sm text-[15px] leading-relaxed text-[#52525B]">
                  Each estimate accounts for storage capacity, enclosure condition, display integrity, and battery health before pickup.
                </p>
                <Link
                  to="/sell"
                  aria-label="Evaluate your smartphone"
                  className="btn-press flex h-12 w-12 items-center justify-center rounded-full border border-[#D4D4D0] text-[#0A0A0C] hover:border-[#0A0A0C] hover:bg-[#0A0A0C] hover:text-white"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Reveal delayMs={0}>
              <Link
                to="/sell"
                className="card-lift group relative flex h-[430px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#050506] p-8 text-white"
              >
                <div className="relative z-10">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-2xl leading-snug font-semibold tracking-[-0.02em]">
                    Enclosure &amp; frame
                    <br />
                    grading.
                  </h3>
                  <p className="mt-2.5 max-w-[220px] text-sm leading-relaxed text-[#A1A1AA]">
                    Clear distinction between spotless finishes, pocket scuffs, and impact wear.
                  </p>
                </div>
                <img
                  src="/images/macro-frame-dark.jpg"
                  alt="Close-up of dark titanium smartphone chassis"
                  className="img-zoom pointer-events-none absolute inset-x-0 bottom-0 h-[65%] w-full object-cover object-bottom"
                />
                <div className="relative z-10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white transition-all duration-300 group-hover:rotate-45 group-hover:border-white group-hover:bg-white group-hover:text-[#0A0A0C]">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>

            <Reveal delayMs={90}>
              <Link
                to="/sell"
                className="card-lift group relative flex h-[430px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#EAEEEF] p-8 text-[#0A0A0C]"
              >
                <div className="relative z-10">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-2xl leading-snug font-semibold tracking-[-0.02em]">
                    Display &amp; camera
                    <br />
                    optics.
                  </h3>
                  <p className="mt-2.5 max-w-[230px] text-sm leading-relaxed text-[#52525B]">
                    Evaluates OLED brightness, touch response, and sapphire camera glass clarity.
                  </p>
                </div>
                <img
                  src="/images/macro-camera-light.jpg"
                  alt="Close-up of silver triple camera module"
                  className="img-zoom pointer-events-none absolute inset-x-0 bottom-0 h-[62%] w-full object-cover object-bottom"
                />
                <div className="relative z-10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0A0A0C]/25 bg-white/70 text-[#0A0A0C] transition-all duration-300 group-hover:rotate-45 group-hover:border-[#0A0A0C] group-hover:bg-[#0A0A0C] group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>

            <Reveal delayMs={180}>
              <Link
                to="/sell"
                className="card-lift group relative flex h-[430px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#0A0A0C] p-8 text-white"
              >
                <div className="relative z-10">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-2xl leading-snug font-semibold tracking-[-0.02em]">
                    Battery health &amp;
                    <br />
                    core sensors.
                  </h3>
                  <p className="mt-2.5 max-w-[230px] text-sm leading-relaxed text-[#A1A1AA]">
                    Accounts for peak battery capacity, Face ID or fingerprint sensors, and audio.
                  </p>
                </div>

                <div className="pointer-events-none my-auto flex items-center justify-center py-6">
                  <div className="aura-breathe relative flex h-20 w-36 items-center justify-center rounded-2xl border-2 border-[#FDE68A]/85 bg-[#F59E0B]/[0.06] shadow-[0_0_42px_rgba(245,158,11,0.3)] transition-transform duration-300 group-hover:scale-105">
                    <div className="absolute -right-2.5 h-7 w-1.5 rounded-r-full bg-[#FDE68A]/85" />
                    <svg viewBox="0 0 24 24" className="h-9 w-9 text-[#FEF3C7]" fill="currentColor" aria-hidden="true">
                      <path d="M13 2L4.5 13.5h6L9.5 22 19.5 10.5h-6L13 2z" />
                    </svg>
                  </div>
                </div>

                <div className="relative z-10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white transition-all duration-300 group-hover:rotate-45 group-hover:border-white group-hover:bg-white group-hover:text-[#0A0A0C]">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>

          <Reveal delayMs={120}>
            <div className="mt-8 grid grid-cols-1 divide-y divide-[#ECECE8] rounded-2xl border border-[#ECECE8] bg-[#FAFAF9] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
              <div className="flex items-center gap-4 px-6 py-5">
                <Sparkles className="h-5 w-5 shrink-0 text-[#0A0A0C]" strokeWidth={1.6} />
                <p className="text-xs leading-snug font-medium text-[#27272A]">
                  Instant online valuation
                  <br />
                  <span className="text-[#71717A]">Quoted in UAE Dirhams</span>
                </p>
              </div>
              <div className="flex items-center gap-4 px-6 py-5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#0A0A0C]" strokeWidth={1.6} />
                <p className="text-xs leading-snug font-medium text-[#27272A]">
                  Permanent data wipe
                  <br />
                  <span className="text-[#71717A]">Privacy verified on handover</span>
                </p>
              </div>
              <div className="flex items-center gap-4 px-6 py-5">
                <Truck className="h-5 w-5 shrink-0 text-[#0A0A0C]" strokeWidth={1.6} />
                <p className="text-xs leading-snug font-medium text-[#27272A]">
                  Doorstep UAE pickup
                  <br />
                  <span className="text-[#71717A]">All 7 Emirates covered</span>
                </p>
              </div>
              <div className="flex items-center gap-4 px-6 py-5">
                <Wallet className="h-5 w-5 shrink-0 text-[#0A0A0C]" strokeWidth={1.6} />
                <p className="text-xs leading-snug font-medium text-[#27272A]">
                  Same-day settlement
                  <br />
                  <span className="text-[#71717A]">UAE IBAN, wallet, or cash</span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          3. SELECTIVE ACCENT SHOWCASE TRIO
         ===================================================================== */}
      <section className="bg-white pb-20 lg:pb-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Link
                to="/sell?brand=apple"
                className="card-lift group relative flex h-[280px] flex-col justify-end overflow-hidden rounded-2xl bg-[#EA580C] p-6"
              >
                <img
                  src="/images/banner-accent-amber.jpg"
                  alt="Angled obsidian flagship smartphone on warm amber studio backdrop"
                  className="img-zoom absolute inset-0 h-full w-full object-cover"
                />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="bg-[#0A0A0C] px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-white uppercase">
                    Pro Flagships
                  </span>
                </div>
              </Link>

              <Link
                to="/sell?brand=samsung"
                className="card-lift group relative flex h-[280px] flex-col justify-end overflow-hidden rounded-2xl bg-[#EAEAE7] p-6"
              >
                <img
                  src="/images/phone-fold-platinum.jpg"
                  alt="Foldable platinum smartphone studio view"
                  className="img-zoom absolute inset-0 m-auto h-[84%] w-[84%] object-contain mix-blend-multiply"
                />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="bg-[#0A0A0C] px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-white uppercase">
                    Foldable Series
                  </span>
                </div>
              </Link>

              <Link
                to="/sell"
                className="card-lift group relative flex h-[280px] flex-col justify-between overflow-hidden rounded-2xl bg-[#FACC15] p-6"
              >
                <div className="relative z-10 flex justify-end">
                  <span className="rounded-full bg-[#0A0A0C]/10 px-3 py-1 font-mono text-[11px] font-semibold text-[#0A0A0C]">
                    Any Grade Accepted
                  </span>
                </div>
                <img
                  src="/images/phone-bar-porcelain.jpg"
                  alt="Porcelain smartphone studio render"
                  className="img-zoom pointer-events-none mx-auto h-40 w-40 rounded-xl bg-white object-contain p-2 shadow-sm"
                />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="bg-[#0A0A0C] px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-white uppercase">
                    Flawless to Cracked
                  </span>
                </div>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          4. SUPPORTED BRANDS GRID
         ===================================================================== */}
      <section id="brands" className="border-y border-[#E6E5E0] bg-[#F8F8F7] py-20 lg:py-28">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                  12 Manufacturers Supported
                </p>
                <h2 className="mt-2 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                  Select your smartphone brand.
                </h2>
              </div>
              <Link
                to="/sell"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A0A0C] underline-offset-4 hover:underline"
              >
                <span>Open Full Configurator</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {BRANDS.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/sell?brand=${brand.id}`}
                  className="card-lift group relative flex h-32 flex-col items-center justify-center rounded-2xl border border-[#E7E7E4] bg-white p-5 hover:border-[#0A0A0C]"
                >
                  <div className="flex h-12 items-center justify-center px-2 transition-transform duration-300 group-hover:scale-105">
                    <BrandLogo
                      brandId={brand.id}
                      className={
                        brand.id === 'google' || brand.id === 'xiaomi'
                          ? 'h-11 w-11'
                          : 'h-8 max-w-[132px]'
                      }
                    />
                  </div>
                  <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] font-medium text-[#8E8E93] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:text-[#0A0A0C] group-hover:opacity-100">
                    <span>Select</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          5. POPULAR BUYBACK MODELS
         ===================================================================== */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-[-0.02em] text-[#0A0A0C] uppercase sm:text-3xl">
                  Highest Valued Models
                </h2>
                <p className="mt-1.5 text-sm text-[#52525B]">
                  Select a device below to jump straight to storage and condition selection.
                </p>
              </div>

              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter models by brand">
                {POPULAR_FILTER_TABS.map((tab) => {
                  const active = activeBrandFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveBrandFilter(tab.id)}
                      className={`btn-press cursor-pointer rounded-full px-4 py-2 text-xs font-semibold ${active
                        ? 'bg-[#0A0A0C] text-white'
                        : 'border border-[#E4E4E0] bg-white text-[#52525B] hover:border-[#0A0A0C] hover:text-[#0A0A0C]'
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
              className="route-enter mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
            >
              {displayedPopularModels.map((model) => {
                const maxPrice = getMaxModelPriceAed(model);
                const storageSummary = model.storageOptions.map((s) => s.capacity).join(' · ');
                return (
                  <Link
                    key={model.id}
                    to={`/sell?brand=${model.brandId}&model=${model.id}`}
                    className="group flex flex-col items-center text-center"
                  >
                    <div className="card-lift relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#EFEFEC] bg-white p-5 group-hover:border-[#0A0A0C]">
                      <img
                        src={model.image}
                        alt={model.name}
                        loading="lazy"
                        className="img-zoom h-full w-full object-contain"
                      />
                      <span className="absolute bottom-3 rounded-full bg-[#0A0A0C] px-3.5 py-1 text-[10px] font-semibold text-white opacity-0 transition-all duration-200 group-hover:opacity-100">
                        Configure Quote
                      </span>
                    </div>
                    <h3 className="mt-4 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0A0A0C]">
                      {model.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-[#71717A]">{storageSummary}</p>
                    <p className="mt-1.5 font-mono text-xs font-semibold text-[#0A0A0C] tabular-nums">
                      Up to {formatAed(maxPrice)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          6. VISUAL EXPLANATION OF THE SELLING PROCESS
         ===================================================================== */}
      <section id="process" className="border-t border-[#ECECE8] bg-[#F8F8F7] py-20 lg:py-28">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                  Selling Journey
                </p>
                <h2 className="mt-2 font-['Plus_Jakarta_Sans'] text-3xl leading-tight font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                  From device selection to UAE payout.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#52525B]">
                  Designed around automatic step-by-step progression rather than long forms or price negotiations.
                </p>
                <div className="mt-7">
                  <Link
                    to="/sell"
                    className="btn-press btn-sheen inline-flex items-center gap-2 rounded-full bg-[#0A0A0C] px-6 py-3 text-xs font-semibold text-white hover:bg-[#232326]"
                  >
                    <span>Begin Step 01</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-[#E5E5E1] bg-[#E5E5E1] sm:grid-cols-2 lg:col-span-8">
                <div className="flex flex-col justify-between bg-white p-7 transition-colors duration-200 hover:bg-[#FAFAF9] sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#0A0A0C]">STEP 01</span>
                    <span className="rounded-full bg-[#F4F4F2] px-2.5 py-1 font-mono text-[11px] text-[#52525B]">
                      Brand · Model · Storage
                    </span>
                  </div>
                  <div className="mt-10">
                    <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0A0A0C]">
                      Select your exact device
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#52525B]">
                      Tap your brand, model, and storage variant—each choice smoothly advances you to the next screen.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between bg-white p-7 transition-colors duration-200 hover:bg-[#FAFAF9] sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#0A0A0C]">STEP 02</span>
                    <span className="rounded-full bg-[#F4F4F2] px-2.5 py-1 font-mono text-[11px] text-[#52525B]">
                      Guided Evaluation
                    </span>
                  </div>
                  <div className="mt-10">
                    <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0A0A0C]">
                      Answer quick condition prompts
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#52525B]">
                      Confirm battery health, display, body, and accessories one prompt at a time with instant visual feedback.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between bg-white p-7 transition-colors duration-200 hover:bg-[#FAFAF9] sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#0A0A0C]">STEP 03</span>
                    <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 font-mono text-[11px] font-medium text-[#059669]">
                      AED Price Lock
                    </span>
                  </div>
                  <div className="mt-10">
                    <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0A0A0C]">
                      Review itemized AED estimate
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#52525B]">
                      See the exact valuation breakdown in UAE Dirhams with zero hidden platform deductions.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between bg-white p-7 transition-colors duration-200 hover:bg-[#FAFAF9] sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#0A0A0C]">STEP 04</span>
                    <span className="rounded-full bg-[#F4F4F2] px-2.5 py-1 font-mono text-[11px] text-[#52525B]">
                      UAE Courier &amp; Payout
                    </span>
                  </div>
                  <div className="mt-10">
                    <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0A0A0C]">
                      Doorstep pickup &amp; instant transfer
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#52525B]">
                      Book collection in your Emirate and receive payment via UAE bank IBAN, wallet, or cash.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          7. ALTERNATING EDITORIAL SPLIT + PLATFORM BENEFITS LEDGER
         ===================================================================== */}
      <section id="benefits" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="group overflow-hidden rounded-3xl bg-[#F3F3F1] lg:col-span-7">
                <img
                  src="/images/editorial-handover.jpg"
                  alt="Titanium smartphone beside protective black courier sleeve on travertine stone"
                  loading="lazy"
                  className="img-zoom h-[340px] w-full object-cover sm:h-[440px]"
                />
              </div>

              <div className="lg:col-span-5">
                <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                  Doorstep Handover
                </p>
                <h2 className="mt-3 font-['Plus_Jakarta_Sans'] text-3xl leading-[1.08] font-extrabold tracking-[-0.035em] text-[#0A0A0C] uppercase sm:text-4xl">
                  Collected on your schedule.
                  <br />
                  Paid on verification.
                </h2>
                <p className="mt-5 text-[15px] leading-relaxed text-[#52525B]">
                  Skip listing photos, stranger meetups, and delayed marketplace payouts. A dedicated RagonBnS specialist collects your device at your home or office anywhere in the UAE, confirms diagnostics in minutes, and releases your AED payout immediately.
                </p>
                <div className="mt-8">
                  <Link
                    to="/sell"
                    className="btn-press btn-sheen inline-flex items-center justify-center bg-[#0A0A0C] px-7 py-3.5 text-xs font-bold tracking-[0.1em] text-white uppercase hover:bg-[#232326]"
                  >
                    Check Your Device Value
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="mt-24 grid grid-cols-1 gap-12 border-t border-[#ECECE8] pt-20 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                  Platform Benefits
                </p>
                <h2 className="mt-2 font-['Plus_Jakarta_Sans'] text-3xl leading-tight font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                  Built for certainty at every stage.
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#52525B]">
                  Every policy is structured to protect your data, your time, and the value of well-kept hardware.
                </p>
              </div>

              <div className="divide-y divide-[#ECECE8] border-y border-[#ECECE8] lg:col-span-7">
                <div className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-12 sm:items-start">
                  <div className="flex items-center gap-2.5 sm:col-span-5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                      7-Day AED Price Guarantee
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-[#52525B] sm:col-span-7">
                    Market values shift weekly, your quote does not. Once submitted, your AED valuation stays locked for seven full days.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-12 sm:items-start">
                  <div className="flex items-center gap-2.5 sm:col-span-5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                      Zero Pickup or Return Fees
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-[#52525B] sm:col-span-7">
                    Collection across Dubai, Abu Dhabi, Sharjah, and Northern Emirates is complimentary. If you change your mind, your phone is returned free of charge.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-12 sm:items-start">
                  <div className="flex items-center gap-2.5 sm:col-span-5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                      Original Box &amp; Warranty Bonus
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-[#52525B] sm:col-span-7">
                    Devices accompanied by their original retail box, genuine charging cable, or active UAE manufacturer warranty earn instant extra AED credit.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-12 sm:items-start">
                  <div className="flex items-center gap-2.5 sm:col-span-5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                      Direct UAE Dirham Settlement
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-[#52525B] sm:col-span-7">
                    Choose instant UAE IBAN transfer, cash at handover, or digital wallet credit—never locked into store vouchers.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          8. CUSTOMER TRUST & REVIEWS
         ===================================================================== */}
      <section id="reviews" className="border-t border-[#E6E5E0] bg-[#F4F4F2] py-20 lg:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-[-0.02em] text-[#0A0A0C] uppercase sm:text-3xl">
                  Recent UAE Sellers
                </h2>
                <p className="mt-1 text-sm text-[#52525B]">
                  Verified device evaluations and completed doorstep handovers.
                </p>
              </div>
              <Link
                to="/sell"
                className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.08em] text-[#0A0A0C] uppercase hover:underline"
              >
                <span>Value Your Device</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {SELLER_REVIEWS.map((rev) => (
                <article
                  key={rev.id}
                  className="card-lift flex flex-col justify-between rounded-2xl border border-[#E5E5E1] bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#0A0A0C]">
                        {rev.seller}{' '}
                        <span className="font-normal text-[#71717A]">· {rev.location}</span>
                      </p>
                      <div className="mt-1.5 flex items-center gap-0.5 text-[#0A0A0C]" aria-label="5 out of 5 stars">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <h3 className="mt-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0A0A0C]">
                        {rev.heading}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#52525B]">{rev.body}</p>
                    </div>

                    <img
                      src={rev.thumb}
                      alt={rev.deviceSold}
                      loading="lazy"
                      className="h-20 w-20 shrink-0 rounded-xl border border-[#EFEFEC] bg-white object-contain p-1.5"
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#F0F0ED] pt-3.5 text-xs">
                    <span className="font-medium text-[#52525B]">{rev.deviceSold}</span>
                    <span className="font-mono font-semibold text-[#0A0A0C] tabular-nums">
                      {formatAed(rev.payoutAed)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          9. CLEAN CLOSING ACTION BAND
         ===================================================================== */}
      <section className="border-t border-[#E6E5E0] bg-white py-18 text-center lg:py-24">
        <Reveal>
          <div className="mx-auto max-w-2xl px-5">
            <h2 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-[-0.03em] text-[#0A0A0C] uppercase sm:text-4xl">
              Ready to value your phone?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#52525B] sm:text-base">
              Configure your brand, model, storage, and condition step by step to see your guaranteed AED buyback price.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/sell"
                className="btn-press btn-sheen inline-flex h-13 items-center gap-2 rounded-full bg-[#0A0A0C] px-8 text-xs font-bold tracking-[0.1em] text-white uppercase hover:bg-[#232326]"
              >
                <span>Start Phone Selection</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
