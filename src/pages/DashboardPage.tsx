import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react';
import { DEFAULT_B2B_ACCOUNT } from '../data/catalog';
import { formatAed } from '../lib/valuationEngine';
import { listSavedSubmissions } from '../services/submissionService';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const submissions = useMemo(() => listSavedSubmissions().slice(0, 3), []);

  const initials = useMemo(() => {
    const parts = DEFAULT_B2B_ACCOUNT.contactPerson.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <main
      id="main-content"
      className="route-enter min-h-[calc(100svh-3.5rem)] bg-[#F6F8FB] py-4 sm:min-h-[calc(100svh-4rem)] sm:py-8"
    >
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Compact Top Bar */}
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="btn-press inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-white px-3.5 text-xs font-semibold text-[#0F172A] hover:border-[#2095D3] hover:text-[#2095D3]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>

          <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-[#64748B] uppercase">
            User Dashboard
          </span>
        </div>

        {/* Profile Identity Card */}
        <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:rounded-3xl">
          <div className="bg-[#0B1120] p-4.5 text-white sm:p-6">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2095D3] font-['Plus_Jakarta_Sans'] text-base font-extrabold text-white shadow-[0_6px_18px_rgba(32,149,211,0.35)] sm:h-14 sm:w-14 sm:text-lg">
                {initials || <User className="h-6 w-6" />}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="truncate font-['Plus_Jakarta_Sans'] text-lg font-extrabold tracking-[-0.02em] text-white sm:text-xl">
                  {DEFAULT_B2B_ACCOUNT.contactPerson}
                </h1>
                <p className="mt-0.5 truncate text-xs text-slate-300 sm:text-sm">
                  {DEFAULT_B2B_ACCOUNT.companyName}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#2095D3]/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#5CC2F8]">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    ID: {DEFAULT_B2B_ACCOUNT.accountCode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Account Information Grid */}
          <div className="divide-y divide-[#F1F5F9] p-4 sm:p-6">
            <div className="pb-3.5">
              <h2 className="font-mono text-[10.5px] font-semibold tracking-[0.08em] text-[#64748B] uppercase">
                Personal &amp; Contact Information
              </h2>

              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#2095D3]" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#64748B]">Mobile Number</p>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-[#0F172A]">
                      {DEFAULT_B2B_ACCOUNT.contactPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#2095D3]" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#64748B]">Email Address</p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-[#0F172A]">
                      {DEFAULT_B2B_ACCOUNT.contactEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2095D3]" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#64748B]">Registered Entity</p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-[#0F172A]">
                      {DEFAULT_B2B_ACCOUNT.companyName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2095D3]" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#64748B]">Registered Emirate</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#0F172A]">
                      {DEFAULT_B2B_ACCOUNT.tradeLicenseEmirate}, UAE
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup & Settlement Information */}
            <div className="pt-3.5">
              <h2 className="font-mono text-[10.5px] font-semibold tracking-[0.08em] text-[#64748B] uppercase">
                Collection &amp; Payout Details
              </h2>

              <div className="mt-2.5 space-y-2.5">
                <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2095D3]" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#64748B]">Default Pickup Address</p>
                    <p className="mt-0.5 text-xs leading-snug font-semibold text-[#0F172A]">
                      {DEFAULT_B2B_ACCOUNT.registeredAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[#2095D3]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <p className="text-[11px] text-[#64748B]">
                        {DEFAULT_B2B_ACCOUNT.settlementMethodLabel}
                      </p>
                      <span className="rounded-full bg-[#EBF7FD] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#187BB2]">
                        Active
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-[#0F172A]">
                      {DEFAULT_B2B_ACCOUNT.maskedIban}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Submitted Evaluations (if any) */}
            {submissions.length > 0 && (
              <div className="pt-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-[10.5px] font-semibold tracking-[0.08em] text-[#64748B] uppercase">
                    Recent Sell Orders
                  </h2>
                  <span className="font-mono text-[10.5px] text-[#64748B]">
                    {submissions.length} recent
                  </span>
                </div>

                <div className="mt-2.5 space-y-2">
                  {submissions.map((item) => (
                    <div
                      key={item.referenceCode}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Smartphone className="h-4 w-4 shrink-0 text-[#2095D3]" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[#0F172A]">
                            {item.saleDetails.quantity > 1 ? `${item.saleDetails.quantity}× ` : ''}
                            {item.modelName}
                            {item.storage !== 'Custom' ? ` · ${item.storage}` : ''}
                          </p>
                          <p className="truncate font-mono text-[10px] text-[#64748B]">
                            {item.referenceCode} · {item.conditionTitle}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 font-mono text-xs font-bold text-[#187BB2] tabular-nums">
                        {item.valuation.isAgentQuote
                          ? 'Agent Quote'
                          : formatAed(item.valuation.finalEstimateAed)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;
