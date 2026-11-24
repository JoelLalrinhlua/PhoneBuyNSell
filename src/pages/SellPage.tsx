import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
  X,
  BatteryCharging,
  Smartphone,
  Cpu,
  CalendarClock,
  MapPin,
  Printer,
  RotateCcw,
  Layers,
  MessageSquareText,
} from 'lucide-react';
import {
  BRANDS,
  CONDITION_TIERS,
  PHONE_MODELS,
  UAE_EMIRATES,
} from '../data/catalog';
import { BrandLogo } from '../components/BrandLogo';
import { AnimatedAed } from '../components/MotionPrimitives';
import {
  calculateValuation,
  formatAed,
  getMaxModelPriceAed,
} from '../lib/valuationEngine';
import { saveSellSubmission } from '../services/submissionService';
import type {
  BatteryHealthTier,
  BodyPartsStatus,
  BrandId,
  ConditionId,
  DeviceEvaluation,
  FunctionalStatus,
  PayoutMethod,
  PickupSlot,
  ScreenStatus,
  SellSubmissionRecord,
  StorageCapacity,
  UAEEmirate,
} from '../types/buyback';

type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type EvalSubStep = 1 | 2 | 3 | 4;

const STEPS: { step: StepNumber; short: string; title: string }[] = [
  { step: 1, short: 'Brand', title: 'Select Brand' },
  { step: 2, short: 'Model', title: 'Select Model' },
  { step: 3, short: 'Storage', title: 'Select Storage' },
  { step: 4, short: 'Condition', title: 'Select Condition' },
  { step: 5, short: 'Evaluation', title: 'Device Check' },
  { step: 6, short: 'Estimate', title: 'Price Summary' },
  { step: 7, short: 'Submit', title: 'Selling Details' },
];

const EVAL_SUBSTEPS: { sub: EvalSubStep; short: string; label: string }[] = [
  { sub: 1, short: 'Battery', label: 'Battery Health' },
  { sub: 2, short: 'Display', label: 'Display Glass' },
  { sub: 3, short: 'Body & Parts', label: 'Body & Parts' },
  { sub: 4, short: 'Function', label: 'Functionality' },
];

const INITIAL_EVALUATION: DeviceEvaluation = {
  batteryHealth: '90-above',
  screenStatus: 'no-scratch',
  bodyPartsStatus: 'no-scratch-original',
  functionalStatus: 'full-working',
  agentIssueDetails: '',
};

const AUTO_ADVANCE_MS = 180;

export const SellPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const advanceTimerRef = useRef<number | null>(null);

  const initialSetup = useMemo(() => {
    const brandParam = searchParams.get('brand') as BrandId | null;
    const modelParam = searchParams.get('model');

    const validBrand = BRANDS.find((b) => b.id === brandParam) ?? null;
    const validModel =
      modelParam ? PHONE_MODELS.find((m) => m.id === modelParam) ?? null : null;

    if (validModel) {
      return {
        step: 3 as StepNumber,
        brandId: validModel.brandId,
        modelId: validModel.id,
        storage: validModel.storageOptions[0].capacity,
        colorName: validModel.colors[0]?.name ?? 'Standard',
      };
    }

    if (validBrand) {
      return {
        step: 2 as StepNumber,
        brandId: validBrand.id,
        modelId: null as string | null,
        storage: null as StorageCapacity | null,
        colorName: '',
      };
    }

    return {
      step: 1 as StepNumber,
      brandId: null as BrandId | null,
      modelId: null as string | null,
      storage: null as StorageCapacity | null,
      colorName: '',
    };
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState<StepNumber>(initialSetup.step);
  const [evalSubStep, setEvalSubStep] = useState<EvalSubStep>(1);
  const [transitionDir, setTransitionDir] = useState<'forward' | 'backward'>('forward');

  const [selectedBrandId, setSelectedBrandId] = useState<BrandId | 'other' | null>(
    initialSetup.brandId
  );
  const [selectedModelId, setSelectedModelId] = useState<string | null>(initialSetup.modelId);
  const [customDeviceName, setCustomDeviceName] = useState('');
  const [selectedStorage, setSelectedStorage] = useState<StorageCapacity | null>(
    initialSetup.storage
  );
  const [selectedColor, setSelectedColor] = useState<string>(initialSetup.colorName);
  const [selectedCondition, setSelectedCondition] = useState<ConditionId | null>(null);
  const [evaluation, setEvaluation] = useState<DeviceEvaluation>(INITIAL_EVALUATION);

  const [modelQuery, setModelQuery] = useState('');
  const [seriesFilter, setSeriesFilter] = useState<string>('all');

  const [fullName, setFullName] = useState('');
  const [phoneUae, setPhoneUae] = useState('');
  const [email, setEmail] = useState('');
  const [emirate, setEmirate] = useState<UAEEmirate>('Dubai');
  const [areaAndStreet, setAreaAndStreet] = useState('');
  const [buildingOrVilla, setBuildingOrVilla] = useState('');
  const [pickupSlot, setPickupSlot] = useState<PickupSlot>('tomorrow-morning');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('uae-bank-iban');
  const [ibanOptional, setIbanOptional] = useState('');
  const [deviceSpecRegion, setDeviceSpecRegion] = useState<'UAE TDRA' | 'International'>(
    'UAE TDRA'
  );
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedRecord, setSubmittedRecord] = useState<SellSubmissionRecord | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const scheduleAutoAdvance = (fn: () => void) => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = window.setTimeout(() => {
      setTransitionDir('forward');
      fn();
    }, AUTO_ADVANCE_MS);
  };

  const navigateToStep = (target: StepNumber, targetSubStep?: EvalSubStep) => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    if (target > currentStep) {
      setTransitionDir('forward');
    } else if (target < currentStep) {
      setTransitionDir('backward');
    } else if (target === 5 && targetSubStep !== undefined) {
      setTransitionDir(targetSubStep >= evalSubStep ? 'forward' : 'backward');
    }
    setCurrentStep(target);
    if (targetSubStep !== undefined) {
      setEvalSubStep(targetSubStep);
    }
  };

  useEffect(() => {
    setCurrentStep(initialSetup.step);
    setEvalSubStep(1);
    setSelectedBrandId(initialSetup.brandId);
    setSelectedModelId(initialSetup.modelId);
    setSelectedStorage(initialSetup.storage);
    setSelectedColor(initialSetup.colorName);
    setSubmittedRecord(null);
  }, [initialSetup]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, evalSubStep]);

  const isCustomUnlistedDevice =
    selectedBrandId === 'other' || selectedModelId === 'other-device';

  const selectedBrand = useMemo(() => {
    if (!selectedBrandId || selectedBrandId === 'other') return null;
    return BRANDS.find((b) => b.id === selectedBrandId) ?? null;
  }, [selectedBrandId]);

  const selectedModel = useMemo(() => {
    if (!selectedModelId || selectedModelId === 'other-device') return null;
    return PHONE_MODELS.find((m) => m.id === selectedModelId) ?? null;
  }, [selectedModelId]);

  const brandModels = useMemo(() => {
    if (!selectedBrandId || selectedBrandId === 'other') return PHONE_MODELS;
    return PHONE_MODELS.filter((m) => m.brandId === selectedBrandId);
  }, [selectedBrandId]);

  const availableSeries = useMemo(() => {
    return Array.from(new Set(brandModels.map((m) => m.series)));
  }, [brandModels]);

  const filteredModels = useMemo(() => {
    const q = modelQuery.trim().toLowerCase();
    let pool = brandModels;
    if (q) {
      const brandMatches = brandModels.filter(
        (m) => m.name.toLowerCase().includes(q) || m.series.toLowerCase().includes(q)
      );
      pool =
        brandMatches.length > 0
          ? brandMatches
          : PHONE_MODELS.filter(
              (m) => m.name.toLowerCase().includes(q) || m.series.toLowerCase().includes(q)
            );
    } else if (seriesFilter !== 'all') {
      pool = pool.filter((m) => m.series === seriesFilter);
    }
    return pool;
  }, [brandModels, modelQuery, seriesFilter]);

  const activeConditionForCalc: ConditionId = isCustomUnlistedDevice
    ? 'others-agent'
    : (selectedCondition ?? 'zero-scratch');

  const liveValuation = useMemo(() => {
    if (isCustomUnlistedDevice) {
      return calculateValuation(null, null, 'others-agent', evaluation);
    }
    if (!selectedModel) return null;
    const activeStorage = selectedStorage ?? selectedModel.storageOptions[0].capacity;
    return calculateValuation(
      selectedModel,
      activeStorage,
      activeConditionForCalc,
      evaluation
    );
  }, [isCustomUnlistedDevice, selectedModel, selectedStorage, activeConditionForCalc, evaluation]);

  const progressPercent = useMemo(() => {
    if (currentStep < 5) return ((currentStep - 1) / 6.4) * 100 + 9;
    if (currentStep === 5) {
      const base = (4 / 6.4) * 100;
      const span = (1 / 6.4) * 100;
      return base + ((evalSubStep - 1) / 4) * span + 5;
    }
    if (currentStep === 6) return 88;
    return 100;
  }, [currentStep, evalSubStep]);

  const canNavigateToStep = (target: StepNumber): boolean => {
    if (submittedRecord) return false;
    if (target === 1) return true;
    if (isCustomUnlistedDevice) {
      return target === 6 || target === 7;
    }
    if (target === 2) return Boolean(selectedBrandId);
    if (target === 3) return Boolean(selectedBrandId && selectedModelId);
    if (target === 4) return Boolean(selectedBrandId && selectedModelId && selectedStorage);
    if (target === 5)
      return Boolean(
        selectedBrandId &&
          selectedModelId &&
          selectedStorage &&
          selectedCondition &&
          selectedCondition !== 'others-agent'
      );
    if (target >= 6)
      return Boolean(
        selectedBrandId && selectedModelId && selectedStorage && selectedCondition
      );
    return false;
  };

  const handleSelectBrand = (brandId: BrandId) => {
    if (brandId !== selectedBrandId) {
      setSelectedBrandId(brandId);
      setSelectedModelId(null);
      setSelectedStorage(null);
      setSelectedColor('');
      setSeriesFilter('all');
      setModelQuery('');
    }
    scheduleAutoAdvance(() => setCurrentStep(2));
  };

  const handleSelectOtherUnlistedDevice = () => {
    setSelectedBrandId((prev) => prev ?? 'other');
    setSelectedModelId('other-device');
    setSelectedCondition('others-agent');
    scheduleAutoAdvance(() => setCurrentStep(6));
  };

  const handleSelectModel = (modelId: string) => {
    const model = PHONE_MODELS.find((m) => m.id === modelId);
    if (!model) return;
    setSelectedBrandId(model.brandId);
    setSelectedModelId(model.id);

    const hasExistingStorage =
      selectedStorage && model.storageOptions.some((s) => s.capacity === selectedStorage);
    setSelectedStorage(
      hasExistingStorage ? selectedStorage : model.storageOptions[0].capacity
    );

    const hasExistingColor =
      selectedColor && model.colors.some((c) => c.name === selectedColor);
    setSelectedColor(hasExistingColor ? selectedColor : (model.colors[0]?.name ?? 'Standard'));

    scheduleAutoAdvance(() => setCurrentStep(3));
  };

  const handleSelectStorage = (capacity: StorageCapacity) => {
    setSelectedStorage(capacity);
    scheduleAutoAdvance(() => setCurrentStep(4));
  };

  const handleSelectCondition = (condId: ConditionId) => {
    setSelectedCondition(condId);

    if (condId === 'others-agent') {
      scheduleAutoAdvance(() => setCurrentStep(6));
      return;
    }

    setEvaluation((prev) => {
      switch (condId) {
        case 'zero-scratch':
          return {
            ...prev,
            batteryHealth: '90-above',
            screenStatus: 'no-scratch',
            bodyPartsStatus: 'no-scratch-original',
            functionalStatus: 'full-working',
          };
        case 'small-scratch':
          return {
            ...prev,
            batteryHealth: prev.batteryHealth === 'below-85' ? '85-89' : prev.batteryHealth,
            screenStatus: 'small-scratch',
            bodyPartsStatus: 'no-scratch-original',
            functionalStatus: 'full-working',
          };
        case 'medium-scratch':
          return {
            ...prev,
            batteryHealth: prev.batteryHealth === 'below-85' ? '85-89' : prev.batteryHealth,
            screenStatus: 'medium-deep-scratch',
            bodyPartsStatus: 'body-dent-scratch',
            functionalStatus: 'full-working',
          };
        case 'parts-change-genuine':
          return {
            ...prev,
            batteryHealth: '85-89',
            screenStatus: 'no-scratch',
            bodyPartsStatus: 'genuine-part-changed',
            functionalStatus: 'full-working',
          };
        case 'more-scratch-broken':
          return {
            ...prev,
            screenStatus: 'display-crack',
            bodyPartsStatus: 'back-glass-broken-dent',
            functionalStatus: 'full-working',
          };
        case 'hardware-unknown-parts':
          return {
            ...prev,
            functionalStatus: 'faceid-hardware-issue',
          };
      }
    });

    scheduleAutoAdvance(() => {
      setEvalSubStep(1);
      setCurrentStep(5);
    });
  };

  const handleSelectBattery = (tier: BatteryHealthTier) => {
    setEvaluation((p) => ({ ...p, batteryHealth: tier }));
    scheduleAutoAdvance(() => setEvalSubStep(2));
  };

  const handleSelectScreen = (status: ScreenStatus) => {
    setEvaluation((p) => ({ ...p, screenStatus: status }));
    scheduleAutoAdvance(() => setEvalSubStep(3));
  };

  const handleSelectBodyParts = (status: BodyPartsStatus) => {
    setEvaluation((p) => ({ ...p, bodyPartsStatus: status }));
    scheduleAutoAdvance(() => setEvalSubStep(4));
  };

  const handleSelectFunctionality = (status: FunctionalStatus) => {
    setEvaluation((p) => ({ ...p, functionalStatus: status }));
    if (status === 'other-agent-issue') {
      setSelectedCondition('others-agent');
    }
    scheduleAutoAdvance(() => setCurrentStep(6));
  };

  const handleStepBack = () => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    setTransitionDir('backward');

    if (currentStep === 6 && isCustomUnlistedDevice) {
      setCurrentStep(selectedBrandId && selectedBrandId !== 'other' ? 2 : 1);
      return;
    }
    if (currentStep === 6 && selectedCondition === 'others-agent') {
      setCurrentStep(4);
      return;
    }
    if (currentStep === 5 && evalSubStep > 1) {
      setEvalSubStep((s) => (s - 1) as EvalSubStep);
      return;
    }
    if (currentStep === 6) {
      setCurrentStep(5);
      setEvalSubStep(4);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepNumber);
    }
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveValuation) return;

    const errors: Record<string, string> = {};
    if (fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
    if (phoneUae.replace(/\D/g, '').length < 9)
      errors.phoneUae = 'Enter a valid UAE mobile number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errors.email = 'Enter a valid email address.';
    if (areaAndStreet.trim().length < 3)
      errors.areaAndStreet = 'Enter your community and street.';
    if (buildingOrVilla.trim().length < 2)
      errors.buildingOrVilla = 'Enter your building or villa.';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const saved = saveSellSubmission({
      brandId: selectedBrand ? selectedBrand.id : 'other',
      brandName: selectedBrand ? selectedBrand.name : 'Custom Brand',
      modelId: selectedModel ? selectedModel.id : 'other-device',
      modelName: selectedModel
        ? selectedModel.name
        : customDeviceName.trim() || 'Unlisted Device',
      storage: selectedStorage ?? 'Custom',
      colorName: selectedColor || 'Standard',
      conditionId: liveValuation.appliedTierId,
      conditionTitle: liveValuation.appliedTierTitle,
      evaluation,
      valuation: liveValuation,
      seller: {
        fullName: fullName.trim(),
        phoneUae: phoneUae.trim(),
        email: email.trim(),
        emirate,
        areaAndStreet: areaAndStreet.trim(),
        buildingOrVilla: buildingOrVilla.trim(),
        pickupSlot,
        payoutMethod,
        ibanOptional: ibanOptional.trim() || undefined,
        deviceSpecRegion,
        notes: notes.trim() || undefined,
      },
    });

    setSubmittedRecord(saved);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetAnotherPhone = () => {
    setSubmittedRecord(null);
    setSelectedBrandId(null);
    setSelectedModelId(null);
    setCustomDeviceName('');
    setSelectedStorage(null);
    setSelectedColor('');
    setSelectedCondition(null);
    setEvaluation(INITIAL_EVALUATION);
    setEvalSubStep(1);
    setTransitionDir('forward');
    setCurrentStep(1);
  };

  const slideAnimationClass =
    transitionDir === 'forward' ? 'step-slide-forward' : 'step-slide-backward';

  // =========================================================================
  // SUBMITTED CONFIRMATION RECEIPT VIEW
  // =========================================================================
  if (submittedRecord) {
    const slotLabel =
      submittedRecord.seller.pickupSlot === 'today-evening'
        ? 'Today · 6:00 PM – 9:00 PM'
        : submittedRecord.seller.pickupSlot === 'tomorrow-morning'
          ? 'Tomorrow · 10:00 AM – 1:00 PM'
          : 'Tomorrow · 5:00 PM – 9:00 PM';

    const payoutLabel =
      submittedRecord.seller.payoutMethod === 'uae-bank-iban'
        ? 'UAE Bank IBAN'
        : submittedRecord.seller.payoutMethod === 'instant-cash'
          ? 'Cash on Pickup'
          : 'Digital Wallet';

    return (
      <main id="main-content" className="min-h-[82vh] bg-[#F6F8FB] py-8 sm:py-14">
        <div className="step-slide-forward mx-auto max-w-3xl px-4 sm:px-8">
          <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
            <div className="bg-[#0B1120] p-6 text-white sm:p-9">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/arsouq-logo-nav.png"
                    alt="arsouq.com"
                    width={95}
                    height={35}
                    className="h-6 w-auto object-contain sm:h-7"
                  />
                  <span className="h-4 w-px bg-white/15" />
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2095D3]/20 px-3 py-1 font-mono text-[11px] font-semibold text-[#5CC2F8]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {submittedRecord.valuation.isAgentQuote ? 'Request Sent' : 'Confirmed'}
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  Ref: <strong className="text-white">{submittedRecord.referenceCode}</strong>
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 items-end gap-4 sm:grid-cols-12">
                <div className="sm:col-span-7">
                  <p className="text-[11px] tracking-[0.1em] text-slate-400 uppercase">
                    {submittedRecord.valuation.isAgentQuote
                      ? 'Quote Status'
                      : '7-Day Locked Offer'}
                  </p>
                  <p className="mt-1 font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-[-0.03em] text-white tabular-nums sm:text-5xl">
                    {submittedRecord.valuation.isAgentQuote
                      ? 'Reply by Agent'
                      : formatAed(submittedRecord.valuation.finalEstimateAed)}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
                    {submittedRecord.brandName} {submittedRecord.modelName}
                    {submittedRecord.storage !== 'Custom'
                      ? ` · ${submittedRecord.storage} · ${submittedRecord.colorName}`
                      : ''}
                  </p>
                </div>

                <div className="sm:col-span-5 sm:text-right">
                  <p className="text-xs text-slate-400">Condition</p>
                  <p className="text-sm font-semibold text-white">
                    {submittedRecord.conditionTitle}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">Payout</p>
                  <p className="text-sm font-semibold text-white">{payoutLabel}</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-9">
              <div className="grid grid-cols-1 gap-6 border-b border-[#E2E8F0] pb-6 sm:grid-cols-2">
                <div>
                  <h2 className="font-mono text-xs font-semibold text-[#64748B] uppercase">
                    Collection Address
                  </h2>
                  <p className="mt-2 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                    {submittedRecord.seller.fullName}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {submittedRecord.seller.buildingOrVilla}, {submittedRecord.seller.areaAndStreet},{' '}
                    {submittedRecord.seller.emirate}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#64748B]">
                    {submittedRecord.seller.phoneUae}
                  </p>
                </div>

                <div>
                  <h2 className="font-mono text-xs font-semibold text-[#64748B] uppercase">
                    Schedule
                  </h2>
                  <p className="mt-2 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                    {submittedRecord.valuation.isAgentQuote
                      ? 'Specialist Callback'
                      : slotLabel}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                    {submittedRecord.valuation.isAgentQuote
                      ? 'Our specialist will contact you shortly with your best AED offer.'
                      : 'Our courier messages 30 minutes before arrival and pays immediately on verification.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-press inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-white px-4 py-2 text-xs font-semibold text-[#0F172A] hover:border-[#2095D3]"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAnotherPhone}
                    className="btn-press inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-white px-4 py-2 text-xs font-semibold text-[#0F172A] hover:border-[#2095D3]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Sell Another
                  </button>
                </div>

                <Link
                  to="/"
                  className="btn-press inline-flex items-center rounded-full bg-[#2095D3] px-6 py-2 text-xs font-semibold text-white hover:bg-[#187BB2]"
                >
                  Done
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================================
  // INTERACTIVE STEP-BY-STEP CONFIGURATOR
  // =========================================================================
  return (
    <main id="main-content" className="route-enter min-h-screen bg-[#F6F8FB] pb-16">
      {/* Compact Sticky Progress Header */}
      <div className="sticky top-14 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md sm:top-16">
        <div className="mx-auto max-w-[1280px] px-4 py-2.5 sm:px-8 sm:py-3 lg:px-10">
          {/* Desktop 7-Step Tracker */}
          <nav aria-label="Valuation steps" className="hidden lg:block">
            <ol className="grid grid-cols-7 gap-2">
              {STEPS.map((item) => {
                const isActive = currentStep === item.step;
                const isCompleted = currentStep > item.step;
                const unlocked = canNavigateToStep(item.step);

                return (
                  <li key={item.step}>
                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() => unlocked && navigateToStep(item.step)}
                      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                        isActive
                          ? 'cursor-pointer border-[#2095D3] bg-[#2095D3] text-white'
                          : isCompleted
                            ? 'cursor-pointer border-[#E2E8F0] bg-[#F6F8FB] text-[#0F172A] hover:border-[#2095D3]'
                            : unlocked
                              ? 'cursor-pointer border-transparent text-[#64748B] hover:bg-[#F6F8FB]'
                              : 'cursor-not-allowed border-transparent text-slate-400'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                          isActive
                            ? 'bg-white text-[#2095D3]'
                            : isCompleted
                              ? 'bg-[#2095D3] text-white'
                              : 'bg-slate-200 text-[#64748B]'
                        }`}
                      >
                        {isCompleted ? <Check className="h-3 w-3" /> : `0${item.step}`}
                      </span>
                      <span className="truncate text-xs font-semibold">{item.short}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Mobile & Tablet Compact Header */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                {(currentStep > 1 || (currentStep === 5 && evalSubStep > 1)) && (
                  <button
                    type="button"
                    onClick={handleStepBack}
                    aria-label="Previous step"
                    className="btn-press flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F172A]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-semibold text-[#64748B]">
                    STEP 0{currentStep}/07
                    {currentStep === 5 ? ` · ${evalSubStep}/4` : ''}
                  </p>
                  <p className="truncate font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0F172A] sm:text-sm">
                    {currentStep === 5
                      ? EVAL_SUBSTEPS[evalSubStep - 1].label
                      : STEPS[currentStep - 1].title}
                  </p>
                </div>
              </div>

              {liveValuation && currentStep >= 3 && (
                <div className="shrink-0 text-right">
                  {liveValuation.isAgentQuote ? (
                    <span className="font-mono text-xs font-bold text-[#187BB2]">
                      Reply by agent
                    </span>
                  ) : (
                    <AnimatedAed
                      amount={liveValuation.finalEstimateAed}
                      className="font-mono text-xs font-bold text-[#187BB2] sm:text-sm"
                    />
                  )}
                </div>
              )}
            </div>

            {(selectedBrand || selectedModel || selectedStorage) && (
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {selectedBrand && (
                  <button
                    type="button"
                    onClick={() => navigateToStep(1)}
                    className="shrink-0 rounded-full border border-[#E2E8F0] bg-[#F6F8FB] px-2.5 py-0.5 text-[11px] font-medium text-[#0F172A]"
                  >
                    {selectedBrand.name}
                  </button>
                )}
                {selectedModel && (
                  <button
                    type="button"
                    onClick={() => navigateToStep(2)}
                    className="shrink-0 rounded-full border border-[#E2E8F0] bg-[#F6F8FB] px-2.5 py-0.5 text-[11px] font-medium text-[#0F172A]"
                  >
                    {selectedModel.name}
                  </button>
                )}
                {selectedStorage && (
                  <button
                    type="button"
                    onClick={() => navigateToStep(3)}
                    className="shrink-0 rounded-full border border-[#E2E8F0] bg-[#F6F8FB] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#0F172A]"
                  >
                    {selectedStorage}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="h-[2.5px] w-full bg-[#E2E8F0]" aria-hidden="true">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-[#2095D3] transition-all duration-300 ease-out"
          />
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 pt-4 sm:px-8 sm:pt-7 lg:px-10 lg:pt-8">
        {/* STEP 1: BRAND SELECTION (All 12 fit on 1 screen on Mobile & Desktop) */}
        {currentStep === 1 && (
          <section key="step-1" className={slideAnimationClass}>
            <div className="mb-3.5 sm:mb-5">
              <h1 className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
                Select your brand
              </h1>
            </div>

            <div
              className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3.5 lg:grid-cols-6"
              role="radiogroup"
              aria-label="Smartphone brands"
            >
              {BRANDS.map((brand) => {
                const isSelected = selectedBrandId === brand.id;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectBrand(brand.id)}
                    className={`card-lift group relative flex h-[72px] cursor-pointer items-center justify-center rounded-xl border px-2.5 py-2 sm:h-26 sm:rounded-2xl sm:p-4 ${
                      isSelected
                        ? 'border-[#2095D3] bg-white ring-2 ring-[#2095D3]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#2095D3]'
                    }`}
                  >
                    <span
                      className={`absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full border sm:top-2.5 sm:right-2.5 sm:h-5 sm:w-5 ${
                        isSelected
                          ? 'check-pop border-[#2095D3] bg-[#2095D3] text-white'
                          : 'border-[#E2E8F0] bg-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                    </span>

                    <BrandLogo
                      brandId={brand.id}
                      className={
                        brand.id === 'google' || brand.id === 'xiaomi'
                          ? 'h-8 w-8 transition-transform duration-200 group-hover:scale-105 sm:h-11 sm:w-11'
                          : 'h-5.5 max-w-[88px] transition-transform duration-200 group-hover:scale-105 sm:h-7 sm:max-w-[120px]'
                      }
                    />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSelectOtherUnlistedDevice}
              className="card-lift mt-3 flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-left hover:border-[#2095D3] sm:mt-4 sm:rounded-2xl sm:px-5 sm:py-3.5"
            >
              <div className="flex items-center gap-3">
                <MessageSquareText className="h-4 w-4 shrink-0 text-[#2095D3]" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A] sm:text-sm">
                    Others — Device Not Listed
                  </p>
                  <p className="text-[11px] text-[#64748B] sm:text-xs">
                    Detail your device for a custom agent offer
                  </p>
                </div>
              </div>
              <span className="shrink-0 font-mono text-[11px] font-semibold text-[#187BB2] sm:text-xs">
                Reply by agent &rarr;
              </span>
            </button>
          </section>
        )}

        {/* STEPS 2..7 */}
        {currentStep >= 2 && (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <div className="mb-3 hidden lg:block">
                <button
                  type="button"
                  onClick={handleStepBack}
                  className="group inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#64748B] transition-colors hover:text-[#0F172A]"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span>
                    {currentStep === 5 && evalSubStep > 1
                      ? `Back to ${EVAL_SUBSTEPS[evalSubStep - 2].short}`
                      : `Back to ${STEPS[currentStep - 2].short}`}
                  </span>
                </button>
              </div>

              {/* STEP 2: MODEL SELECTION */}
              {currentStep === 2 && (
                <section key="step-2" className={slideAnimationClass}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h1 className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
                      Select {selectedBrand?.name} model
                    </h1>
                    <button
                      type="button"
                      onClick={() => navigateToStep(1)}
                      className="btn-press shrink-0 cursor-pointer rounded-full border border-[#CBD5E1] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0F172A] hover:border-[#2095D3] sm:text-xs"
                    >
                      Change Brand
                    </button>
                  </div>

                  <div className="mb-4 space-y-2.5">
                    <div className="relative">
                      <label htmlFor="model-search" className="sr-only">
                        Search models
                      </label>
                      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                      <input
                        id="model-search"
                        type="text"
                        value={modelQuery}
                        onChange={(e) => setModelQuery(e.target.value)}
                        placeholder={`Search ${selectedBrand?.name ?? ''} models...`}
                        className="h-11 w-full rounded-xl border border-[#CBD5E1] bg-white pr-9 pl-10 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#2095D3] focus:outline-none sm:rounded-2xl"
                      />
                      {modelQuery && (
                        <button
                          type="button"
                          onClick={() => setModelQuery('')}
                          aria-label="Clear search"
                          className="absolute top-1/2 right-2.5 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#64748B] hover:bg-slate-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {!modelQuery && availableSeries.length > 1 && (
                      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <button
                          type="button"
                          onClick={() => setSeriesFilter('all')}
                          className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold ${
                            seriesFilter === 'all'
                              ? 'bg-[#2095D3] text-white'
                              : 'border border-[#E2E8F0] bg-white text-[#64748B]'
                          }`}
                        >
                          All ({brandModels.length})
                        </button>
                        {availableSeries.map((series) => (
                          <button
                            key={series}
                            type="button"
                            onClick={() => setSeriesFilter(series)}
                            className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold ${
                              seriesFilter === series
                                ? 'bg-[#2095D3] text-white'
                                : 'border border-[#E2E8F0] bg-white text-[#64748B]'
                            }`}
                          >
                            {series}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3"
                    role="radiogroup"
                    aria-label="Phone models"
                  >
                    {filteredModels.map((model) => {
                      const isSelected = selectedModelId === model.id;
                      const maxVal = getMaxModelPriceAed(model);
                      return (
                        <button
                          key={model.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleSelectModel(model.id)}
                          className={`card-lift group relative flex cursor-pointer flex-col rounded-2xl border bg-white p-3.5 text-left sm:p-4.5 ${
                            isSelected
                              ? 'border-[#2095D3] ring-2 ring-[#2095D3]'
                              : 'border-[#E2E8F0] hover:border-[#2095D3]'
                          }`}
                        >
                          <div className="my-2 flex h-26 w-full items-center justify-center overflow-hidden sm:h-34">
                            <img
                              src={model.image}
                              alt={model.name}
                              width={220}
                              height={220}
                              loading="lazy"
                              decoding="async"
                              className="img-zoom h-full w-full object-contain"
                            />
                          </div>

                          <p className="line-clamp-1 font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0F172A] sm:text-sm">
                            {model.name}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-[#64748B] sm:text-xs">
                            {model.storageOptions.map((s) => s.capacity).join(' / ')}
                          </p>
                          <p className="mt-2 border-t border-[#F1F5F9] pt-2 font-mono text-[11px] font-bold text-[#187BB2] tabular-nums sm:text-xs">
                            Up to {formatAed(maxVal)}
                          </p>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleSelectOtherUnlistedDevice}
                      className="card-lift flex cursor-pointer flex-col items-start justify-between rounded-2xl border border-dashed border-[#CBD5E1] bg-white/60 p-4 text-left hover:border-[#2095D3] hover:bg-white"
                    >
                      <MessageSquareText className="h-5 w-5 text-[#2095D3]" />
                      <div className="mt-4">
                        <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0F172A] sm:text-sm">
                          Others (Not Listed)
                        </p>
                        <p className="mt-1 text-[11px] text-[#64748B]">
                          Detail your model to an agent
                        </p>
                        <p className="mt-2 font-mono text-[11px] font-semibold text-[#187BB2]">
                          Reply by agent &rarr;
                        </p>
                      </div>
                    </button>
                  </div>
                </section>
              )}

              {/* STEP 3: STORAGE SELECTION */}
              {currentStep === 3 && selectedModel && (
                <section key="step-3" className={slideAnimationClass}>
                  <div className="mb-4 sm:mb-5">
                    <h1 className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
                      Select storage
                    </h1>
                    <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                      {selectedModel.name}
                    </p>
                  </div>

                  {selectedModel.colors.length > 0 && (
                    <div className="mb-4 rounded-2xl border border-[#E2E8F0] bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#64748B]">Color</span>
                        <span className="font-mono text-xs font-medium text-[#0F172A]">
                          {selectedColor}
                        </span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {selectedModel.colors.map((c) => {
                          const active = selectedColor === c.name;
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => setSelectedColor(c.name)}
                              className={`btn-press flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                                active
                                  ? 'border-[#2095D3] bg-[#F0F8FD] font-semibold text-[#0F172A]'
                                  : 'border-[#E2E8F0] bg-white text-[#64748B]'
                              }`}
                            >
                              <span
                                style={{ backgroundColor: c.hex }}
                                className="h-3 w-3 rounded-full border border-black/15"
                              />
                              <span>{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div
                    className="grid grid-cols-2 gap-3 sm:gap-4"
                    role="radiogroup"
                    aria-label="Storage capacity"
                  >
                    {selectedModel.storageOptions.map((opt) => {
                      const isSelected = selectedStorage === opt.capacity;
                      const tierMaxPrice = selectedModel.basePriceAed + opt.priceDeltaAed;
                      return (
                        <button
                          key={opt.capacity}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleSelectStorage(opt.capacity)}
                          className={`card-lift flex cursor-pointer items-center justify-between rounded-2xl border bg-white p-4 text-left sm:p-5.5 ${
                            isSelected
                              ? 'border-[#2095D3] ring-2 ring-[#2095D3]'
                              : 'border-[#E2E8F0] hover:border-[#2095D3]'
                          }`}
                        >
                          <div>
                            <p className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                              {opt.capacity}
                            </p>
                            <p className="mt-0.5 font-mono text-[11px] font-semibold text-[#187BB2] tabular-nums sm:text-xs">
                              {formatAed(tierMaxPrice)}
                            </p>
                          </div>

                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border sm:h-6 sm:w-6 ${
                              isSelected
                                ? 'check-pop border-[#2095D3] bg-[#2095D3] text-white'
                                : 'border-[#CBD5E1] bg-white'
                            }`}
                          >
                            {isSelected ? (
                              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-[#64748B]" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* STEP 4: EXACT ARSOUQ CONDITION TIERS */}
              {currentStep === 4 && selectedModel && selectedStorage && (
                <section key="step-4" className={slideAnimationClass}>
                  <div className="mb-4 sm:mb-5">
                    <h1 className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
                      Select device condition
                    </h1>
                    <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                      {selectedModel.name} · {selectedStorage}
                    </p>
                  </div>

                  <div className="space-y-2.5" role="radiogroup" aria-label="Device condition">
                    {CONDITION_TIERS.map((tier) => {
                      const isSelected = selectedCondition === tier.id;
                      const previewVal = calculateValuation(
                        selectedModel,
                        selectedStorage,
                        tier.id,
                        INITIAL_EVALUATION
                      );

                      return (
                        <button
                          key={tier.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleSelectCondition(tier.id)}
                          className={`card-lift group flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white p-4 text-left sm:p-5 ${
                            isSelected
                              ? 'border-[#2095D3] ring-2 ring-[#2095D3]'
                              : 'border-[#E2E8F0] hover:border-[#2095D3]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h2 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A] sm:text-base">
                                {tier.title}
                              </h2>
                              <div className="flex items-center gap-2">
                                {tier.deductionAed !== null && tier.deductionAed > 0 && (
                                  <span className="rounded-full bg-[#F6F8FB] px-2 py-0.5 font-mono text-[10px] font-medium text-[#64748B]">
                                    -AED {tier.deductionAed.toLocaleString('en-US')}
                                  </span>
                                )}
                                <span className="font-mono text-sm font-bold text-[#187BB2] tabular-nums sm:text-base">
                                  {tier.deductionAed === null
                                    ? 'Reply by agent'
                                    : formatAed(previewVal.finalEstimateAed)}
                                </span>
                              </div>
                            </div>

                            {tier.id === 'zero-scratch' ? (
                              <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                                {tier.criteria.map((bullet) => (
                                  <li
                                    key={bullet}
                                    className="flex items-center gap-1.5 text-xs text-[#475569]"
                                  >
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2095D3]" />
                                    <span>{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                                {tier.summary}
                              </p>
                            )}
                          </div>

                          <ChevronRight className="h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#2095D3]" />
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* STEP 5: 4-PART STEP-BY-STEP VERIFICATION */}
              {currentStep === 5 && selectedModel && (
                <section key="step-5" className="space-y-4">
                  <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-[#E2E8F0] bg-white p-1.5 sm:rounded-2xl sm:p-2">
                    {EVAL_SUBSTEPS.map((subItem) => {
                      const active = evalSubStep === subItem.sub;
                      const done = evalSubStep > subItem.sub;
                      return (
                        <button
                          key={subItem.sub}
                          type="button"
                          onClick={() => navigateToStep(5, subItem.sub)}
                          className={`flex cursor-pointer items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors sm:rounded-xl sm:text-xs ${
                            active
                              ? 'bg-[#2095D3] text-white'
                              : done
                                ? 'bg-[#F0F8FD] text-[#187BB2]'
                                : 'text-[#64748B] hover:text-[#0F172A]'
                          }`}
                        >
                          <span className="font-mono text-[10px]">{done ? '✓' : subItem.sub}</span>
                          <span className="truncate">{subItem.short}</span>
                        </button>
                      );
                    })}
                  </div>

                  {evalSubStep === 1 && (
                    <div key="eval-1" className={slideAnimationClass}>
                      <h1 className="mb-3.5 font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                        Battery health
                      </h1>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {(
                          [
                            {
                              id: '90-above' as BatteryHealthTier,
                              title: '90% or Above',
                              sub: 'Zero Scratch full value',
                              badge: 'AED 0',
                            },
                            {
                              id: '85-89' as BatteryHealthTier,
                              title: '85% – 89%',
                              sub: 'Small / Medium Scratch tier',
                              badge: '85%+',
                            },
                            {
                              id: 'below-85' as BatteryHealthTier,
                              title: 'Below 85%',
                              sub: 'Service battery tier',
                              badge: '-AED 400 min',
                            },
                          ] as const
                        ).map((opt) => {
                          const active = evaluation.batteryHealth === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectBattery(opt.id)}
                              className={`card-lift flex cursor-pointer items-center justify-between rounded-2xl border bg-white p-4 text-left sm:flex-col sm:items-start sm:p-5 ${
                                active
                                  ? 'border-[#2095D3] ring-2 ring-[#2095D3]'
                                  : 'border-[#E2E8F0] hover:border-[#2095D3]'
                              }`}
                            >
                              <div className="flex items-center gap-3 sm:w-full sm:justify-between">
                                <BatteryCharging className="h-5 w-5 shrink-0 text-[#2095D3]" />
                                <span className="hidden rounded-full bg-[#F6F8FB] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#64748B] sm:inline-block">
                                  {opt.badge}
                                </span>
                              </div>
                              <div className="ml-3 flex-1 sm:mt-4 sm:ml-0">
                                <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                                  {opt.title}
                                </p>
                                <p className="mt-0.5 text-xs text-[#64748B]">{opt.sub}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 shrink-0 text-[#64748B] sm:hidden" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {evalSubStep === 2 && (
                    <div key="eval-2" className={slideAnimationClass}>
                      <h1 className="mb-3.5 font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                        Display glass
                      </h1>
                      <div className="space-y-2.5">
                        {(
                          [
                            {
                              id: 'no-scratch' as ScreenStatus,
                              title: 'No Scratch on Display',
                              sub: 'Flawless front screen',
                              tag: 'AED 0',
                            },
                            {
                              id: 'small-scratch' as ScreenStatus,
                              title: 'Small Scratch',
                              sub: 'Light hairline wear',
                              tag: '-AED 150',
                            },
                            {
                              id: 'medium-deep-scratch' as ScreenStatus,
                              title: 'Medium or Deep Scratch',
                              sub: 'Visible screen scratches',
                              tag: '-AED 400',
                            },
                            {
                              id: 'display-crack' as ScreenStatus,
                              title: 'Display Crack',
                              sub: 'Cracked glass, screen working',
                              tag: '-AED 700',
                            },
                            {
                              id: 'display-not-working' as ScreenStatus,
                              title: 'Display Not Working',
                              sub: 'Dead touch or damaged OLED',
                              tag: '-AED 1,000',
                            },
                          ] as const
                        ).map((opt) => {
                          const active = evaluation.screenStatus === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectScreen(opt.id)}
                              className={`card-lift flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white p-4 text-left ${
                                active
                                  ? 'border-[#2095D3] ring-2 ring-[#2095D3]'
                                  : 'border-[#E2E8F0] hover:border-[#2095D3]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Smartphone className="h-4 w-4 shrink-0 text-[#2095D3]" />
                                <div>
                                  <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                                    {opt.title}
                                  </p>
                                  <p className="text-xs text-[#64748B]">{opt.sub}</p>
                                </div>
                              </div>
                              <span className="shrink-0 font-mono text-xs font-semibold text-[#187BB2]">
                                {opt.tag}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {evalSubStep === 3 && (
                    <div key="eval-3" className={slideAnimationClass}>
                      <h1 className="mb-3.5 font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                        Body &amp; parts history
                      </h1>
                      <div className="space-y-2.5">
                        {(
                          [
                            {
                              id: 'no-scratch-original' as BodyPartsStatus,
                              title: 'No Scratch · Original Parts',
                              sub: 'Spotless body, no parts replaced',
                              tag: 'AED 0',
                            },
                            {
                              id: 'small-body-scratch' as BodyPartsStatus,
                              title: 'Small Scratch on Body',
                              sub: 'Faint edge wear, original parts',
                              tag: '-AED 150',
                            },
                            {
                              id: 'body-dent-scratch' as BodyPartsStatus,
                              title: 'Small Dent / Medium Scratch',
                              sub: 'Visible body nick or scratch',
                              tag: '-AED 400',
                            },
                            {
                              id: 'genuine-part-changed' as BodyPartsStatus,
                              title: 'Parts Change (Genuine Part)',
                              sub: 'One genuine official part replaced',
                              tag: '-AED 500',
                            },
                            {
                              id: 'back-glass-broken-dent' as BodyPartsStatus,
                              title: 'Back Glass Broken / Frame Dent',
                              sub: 'Cracked back panel or frame dent',
                              tag: '-AED 700',
                            },
                            {
                              id: 'unknown-unofficial-part' as BodyPartsStatus,
                              title: 'Unofficial / Unknown Parts',
                              sub: 'Non-genuine part replaced',
                              tag: '-AED 1,000',
                            },
                          ] as const
                        ).map((opt) => {
                          const active = evaluation.bodyPartsStatus === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectBodyParts(opt.id)}
                              className={`card-lift flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white p-4 text-left ${
                                active
                                  ? 'border-[#2095D3] ring-2 ring-[#2095D3]'
                                  : 'border-[#E2E8F0] hover:border-[#2095D3]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Layers className="h-4 w-4 shrink-0 text-[#2095D3]" />
                                <div>
                                  <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                                    {opt.title}
                                  </p>
                                  <p className="text-xs text-[#64748B]">{opt.sub}</p>
                                </div>
                              </div>
                              <span className="shrink-0 font-mono text-xs font-semibold text-[#187BB2]">
                                {opt.tag}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {evalSubStep === 4 && (
                    <div key="eval-4" className={slideAnimationClass}>
                      <h1 className="mb-3.5 font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                        Device &amp; camera function
                      </h1>
                      <div className="space-y-2.5">
                        {(
                          [
                            {
                              id: 'full-working' as FunctionalStatus,
                              title: 'Full Working',
                              sub: 'Face ID / Touch ID, cameras, audio, and network work',
                              tag: 'AED 0',
                            },
                            {
                              id: 'mic-speaker-camera-dot' as FunctionalStatus,
                              title: 'Mic, Speaker, or Camera Spot',
                              sub: 'Minor audio or camera black dot; core network works',
                              tag: '-AED 700',
                            },
                            {
                              id: 'faceid-hardware-issue' as FunctionalStatus,
                              title: 'Face ID / Hardware Issue',
                              sub: 'Biometrics not working or major sensor fault',
                              tag: '-AED 1,000',
                            },
                            {
                              id: 'other-agent-issue' as FunctionalStatus,
                              title: 'Others — Unlisted Issue',
                              sub: 'Detail your phone to our agent for the best price',
                              tag: 'Reply by agent',
                            },
                          ] as const
                        ).map((opt) => {
                          const active = evaluation.functionalStatus === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectFunctionality(opt.id)}
                              className={`card-lift flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white p-4 text-left ${
                                active
                                  ? 'border-[#2095D3] ring-2 ring-[#2095D3]'
                                  : 'border-[#E2E8F0] hover:border-[#2095D3]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Cpu className="h-4 w-4 shrink-0 text-[#2095D3]" />
                                <div>
                                  <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                                    {opt.title}
                                  </p>
                                  <p className="text-xs text-[#64748B]">{opt.sub}</p>
                                </div>
                              </div>
                              <span className="shrink-0 font-mono text-xs font-semibold text-[#187BB2]">
                                {opt.tag}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* STEP 6: PRICE ESTIMATION OR AGENT QUOTE */}
              {currentStep === 6 && liveValuation && (
                <section key="step-6" className={`${slideAnimationClass} space-y-5`}>
                  <h1 className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
                    {liveValuation.isAgentQuote
                      ? 'Detail your device for our agent'
                      : 'Estimated buyback price'}
                  </h1>

                  {liveValuation.isAgentQuote ? (
                    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F8FD] px-3 py-1 font-mono text-xs font-semibold text-[#187BB2]">
                        <MessageSquareText className="h-3.5 w-3.5" />
                        Reply by agent
                      </span>

                      {isCustomUnlistedDevice && (
                        <div className="mt-4">
                          <label
                            htmlFor="custom-device-name"
                            className="block text-xs font-semibold text-[#0F172A]"
                          >
                            Brand, Model &amp; Storage
                          </label>
                          <input
                            id="custom-device-name"
                            type="text"
                            value={customDeviceName}
                            onChange={(e) => setCustomDeviceName(e.target.value)}
                            placeholder="e.g. Honor Magic6 Pro 512GB"
                            className="mt-1.5 h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#0F172A] focus:border-[#2095D3] focus:outline-none"
                          />
                        </div>
                      )}

                      <div className="mt-4">
                        <label
                          htmlFor="agent-issue-details"
                          className="block text-xs font-semibold text-[#0F172A]"
                        >
                          Device Condition Details
                        </label>
                        <textarea
                          id="agent-issue-details"
                          rows={4}
                          value={evaluation.agentIssueDetails}
                          onChange={(e) =>
                            setEvaluation((p) => ({
                              ...p,
                              agentIssueDetails: e.target.value,
                            }))
                          }
                          placeholder="Describe condition, battery percentage, or any parts replaced..."
                          className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white p-4 text-sm text-[#0F172A] focus:border-[#2095D3] focus:outline-none"
                        />
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={() => navigateToStep(7)}
                          className="btn-press inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#2095D3] px-7 py-3.5 text-xs font-bold text-white uppercase hover:bg-[#187BB2]"
                        >
                          <span>Continue</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-hidden rounded-3xl bg-[#0B1120] text-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                        <div className="grid grid-cols-1 items-center gap-6 p-6 sm:p-8 md:grid-cols-12">
                          <div className="md:col-span-8">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] font-medium text-slate-200">
                              <Sparkles className="h-3.5 w-3.5 text-[#5CC2F8]" />
                              <span>{liveValuation.appliedTierTitle} · 7-Day Lock</span>
                            </div>

                            <p className="mt-4 font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
                              <AnimatedAed amount={liveValuation.finalEstimateAed} />
                            </p>

                            <p className="mt-2 text-xs text-slate-300 sm:text-sm">
                              {selectedBrand?.name} {selectedModel?.name} · {selectedStorage} ·{' '}
                              {selectedColor}
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => navigateToStep(7)}
                                className="btn-press inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#2095D3] px-7 py-3.5 text-xs font-bold text-white uppercase hover:bg-[#187BB2]"
                              >
                                <span>Proceed to Sell</span>
                                <ArrowRight className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => navigateToStep(4)}
                                className="btn-press inline-flex cursor-pointer items-center rounded-full border border-white/20 px-5 py-3.5 text-xs font-semibold text-white hover:border-white"
                              >
                                Edit Condition
                              </button>
                            </div>
                          </div>

                          {selectedModel && (
                            <div className="hidden justify-center md:col-span-4 md:flex">
                              <div className="flex h-40 w-36 items-center justify-center rounded-2xl bg-white p-3.5">
                                <img
                                  src={selectedModel.image}
                                  alt={selectedModel.name}
                                  width={160}
                                  height={160}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 sm:p-7">
                        <h2 className="border-b border-[#E2E8F0] pb-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                          Price Breakdown
                        </h2>

                        <div className="mt-2 divide-y divide-[#F1F5F9]">
                          {liveValuation.lineItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-4 py-3 text-sm"
                            >
                              <div>
                                <p className="font-semibold text-[#0F172A]">{item.label}</p>
                                {item.detail && (
                                  <p className="mt-0.5 text-xs text-[#64748B]">{item.detail}</p>
                                )}
                              </div>
                              <span
                                className={`shrink-0 font-mono font-bold tabular-nums ${
                                  item.kind === 'deduction'
                                    ? 'text-[#DC2626]'
                                    : 'text-[#0F172A]'
                                }`}
                              >
                                {item.amountAed >= 0
                                  ? formatAed(item.amountAed)
                                  : `-${formatAed(Math.abs(item.amountAed))}`}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 flex items-center justify-between border-t border-[#0F172A] pt-3.5">
                          <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                            Final Offer
                          </span>
                          <span className="font-mono text-lg font-extrabold text-[#187BB2] tabular-nums">
                            {formatAed(liveValuation.finalEstimateAed)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </section>
              )}

              {/* STEP 7: SELLING SUBMISSION */}
              {currentStep === 7 && liveValuation && (
                <section key="step-7" className={slideAnimationClass}>
                  <h1 className="mb-4 font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-3xl">
                    Pickup &amp; payout details
                  </h1>

                  <form onSubmit={validateAndSubmit} noValidate className="space-y-4">
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:rounded-3xl sm:p-6">
                      <h2 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                        Contact Details
                      </h2>
                      <div className="mt-3.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="seller-name"
                            className="block text-xs font-semibold text-[#0F172A]"
                          >
                            Full Name
                          </label>
                          <input
                            id="seller-name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Rashid Al Maktoum"
                            className="mt-1 h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#0F172A] focus:border-[#2095D3] focus:outline-none"
                          />
                          {formErrors.fullName && (
                            <p className="mt-1 text-xs font-medium text-[#DC2626]">
                              {formErrors.fullName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="seller-phone"
                            className="block text-xs font-semibold text-[#0F172A]"
                          >
                            UAE Mobile / WhatsApp
                          </label>
                          <input
                            id="seller-phone"
                            type="tel"
                            value={phoneUae}
                            onChange={(e) => setPhoneUae(e.target.value)}
                            placeholder="+971 50 123 4567"
                            className="mt-1 h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#0F172A] focus:border-[#2095D3] focus:outline-none"
                          />
                          {formErrors.phoneUae && (
                            <p className="mt-1 text-xs font-medium text-[#DC2626]">
                              {formErrors.phoneUae}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="seller-email"
                            className="block text-xs font-semibold text-[#0F172A]"
                          >
                            Email Address
                          </label>
                          <input
                            id="seller-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@domain.ae"
                            className="mt-1 h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#0F172A] focus:border-[#2095D3] focus:outline-none"
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-xs font-medium text-[#DC2626]">
                              {formErrors.email}
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <span className="block text-xs font-semibold text-[#0F172A]">
                            Device Region
                          </span>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            {(['UAE TDRA', 'International'] as const).map((reg) => (
                              <button
                                key={reg}
                                type="button"
                                onClick={() => setDeviceSpecRegion(reg)}
                                className={`btn-press cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold ${
                                  deviceSpecRegion === reg
                                    ? 'border-[#2095D3] bg-[#2095D3] text-white'
                                    : 'border-[#CBD5E1] bg-white text-[#64748B]'
                                }`}
                              >
                                {reg}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:rounded-3xl sm:p-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#2095D3]" />
                        <h2 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                          Collection Address
                        </h2>
                      </div>

                      <div className="mt-3.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="seller-emirate"
                            className="block text-xs font-semibold text-[#0F172A]"
                          >
                            Emirate
                          </label>
                          <select
                            id="seller-emirate"
                            value={emirate}
                            onChange={(e) => setEmirate(e.target.value as UAEEmirate)}
                            className="mt-1 h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#0F172A] focus:border-[#2095D3] focus:outline-none"
                          >
                            {UAE_EMIRATES.map((em) => (
                              <option key={em} value={em}>
                                {em}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="seller-area"
                            className="block text-xs font-semibold text-[#0F172A]"
                          >
                            Community &amp; Street
                          </label>
                          <input
                            id="seller-area"
                            type="text"
                            value={areaAndStreet}
                            onChange={(e) => setAreaAndStreet(e.target.value)}
                            placeholder="e.g. Dubai Marina, Al Marsa St"
                            className="mt-1 h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#0F172A] focus:border-[#2095D3] focus:outline-none"
                          />
                          {formErrors.areaAndStreet && (
                            <p className="mt-1 text-xs font-medium text-[#DC2626]">
                              {formErrors.areaAndStreet}
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label
                            htmlFor="seller-building"
                            className="block text-xs font-semibold text-[#0F172A]"
                          >
                            Building / Villa &amp; Unit
                          </label>
                          <input
                            id="seller-building"
                            type="text"
                            value={buildingOrVilla}
                            onChange={(e) => setBuildingOrVilla(e.target.value)}
                            placeholder="e.g. Marina Gate 1, Apt 1804"
                            className="mt-1 h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#0F172A] focus:border-[#2095D3] focus:outline-none"
                          />
                          {formErrors.buildingOrVilla && (
                            <p className="mt-1 text-xs font-medium text-[#DC2626]">
                              {formErrors.buildingOrVilla}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-[#2095D3]" />
                          <span className="text-xs font-semibold text-[#0F172A]">
                            Pickup Window
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                          {(
                            [
                              {
                                id: 'today-evening' as PickupSlot,
                                day: 'Today',
                                hours: '6:00 PM – 9:00 PM',
                              },
                              {
                                id: 'tomorrow-morning' as PickupSlot,
                                day: 'Tomorrow AM',
                                hours: '10:00 AM – 1:00 PM',
                              },
                              {
                                id: 'tomorrow-evening' as PickupSlot,
                                day: 'Tomorrow PM',
                                hours: '5:00 PM – 9:00 PM',
                              },
                            ] as const
                          ).map((slot) => {
                            const active = pickupSlot === slot.id;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setPickupSlot(slot.id)}
                                className={`card-lift cursor-pointer rounded-xl border p-3 text-left ${
                                  active
                                    ? 'border-[#2095D3] bg-[#F0F8FD] ring-2 ring-[#2095D3]'
                                    : 'border-[#E2E8F0] bg-white'
                                }`}
                              >
                                <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0F172A]">
                                  {slot.day}
                                </p>
                                <p className="mt-0.5 font-mono text-[11px] text-[#64748B]">
                                  {slot.hours}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:rounded-3xl sm:p-6">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-[#2095D3]" />
                        <h2 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                          Payout Method
                        </h2>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {(
                          [
                            {
                              id: 'uae-bank-iban' as PayoutMethod,
                              title: 'UAE Bank IBAN',
                              desc: 'Instant AED transfer',
                            },
                            {
                              id: 'instant-cash' as PayoutMethod,
                              title: 'Cash on Pickup',
                              desc: 'AED notes at handover',
                            },
                            {
                              id: 'digital-wallet' as PayoutMethod,
                              title: 'Digital Wallet',
                              desc: 'Instant wallet payout',
                            },
                          ] as const
                        ).map((pm) => {
                          const active = payoutMethod === pm.id;
                          return (
                            <button
                              key={pm.id}
                              type="button"
                              onClick={() => setPayoutMethod(pm.id)}
                              className={`card-lift cursor-pointer rounded-xl border p-3 text-left ${
                                active
                                  ? 'border-[#2095D3] bg-[#F0F8FD] ring-2 ring-[#2095D3]'
                                  : 'border-[#E2E8F0] bg-white'
                              }`}
                            >
                              <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0F172A]">
                                {pm.title}
                              </p>
                              <p className="mt-0.5 text-[11px] text-[#64748B]">{pm.desc}</p>
                            </button>
                          );
                        })}
                      </div>

                      {payoutMethod === 'uae-bank-iban' && (
                        <div className="route-enter mt-3.5">
                          <label
                            htmlFor="seller-iban"
                            className="block text-xs font-semibold text-[#0F172A]"
                          >
                            UAE IBAN (Optional now)
                          </label>
                          <input
                            id="seller-iban"
                            type="text"
                            value={ibanOptional}
                            onChange={(e) => setIbanOptional(e.target.value)}
                            placeholder="AE07 0331 2345 6789 0123 456"
                            className="mt-1 h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 font-mono text-xs text-[#0F172A] focus:border-[#2095D3] focus:outline-none"
                          />
                        </div>
                      )}

                      <div className="mt-3.5">
                        <label
                          htmlFor="seller-notes"
                          className="block text-xs font-semibold text-[#0F172A]"
                        >
                          Courier Note (Optional)
                        </label>
                        <input
                          id="seller-notes"
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Call at gate"
                          className="mt-1 h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#0F172A] focus:border-[#2095D3] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => navigateToStep(6)}
                        className="btn-press inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#CBD5E1] bg-white px-6 py-3 text-xs font-semibold text-[#0F172A]"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>

                      <button
                        type="submit"
                        className="btn-press inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#2095D3] px-8 py-3.5 text-xs font-bold tracking-[0.04em] text-white uppercase shadow-[0_8px_20px_rgba(32,149,211,0.24)] hover:bg-[#187BB2]"
                      >
                        <span>
                          {liveValuation.isAgentQuote
                            ? 'Submit Request'
                            : `Confirm ${formatAed(liveValuation.finalEstimateAed)}`}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </section>
              )}
            </div>

            {/* DESKTOP STICKY SUMMARY RAIL */}
            <aside className="hidden lg:sticky lg:top-28 lg:col-span-4 lg:block">
              <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-5.5 shadow-[0_8px_28px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <span className="font-mono text-[11px] font-semibold text-[#64748B] uppercase">
                    Summary
                  </span>
                  <span className="font-mono text-[11px] font-medium text-[#64748B]">
                    0{currentStep}/07
                  </span>
                </div>

                <div className="my-4 flex h-36 items-center justify-center rounded-2xl bg-[#F6F8FB] p-4">
                  {selectedModel ? (
                    <img
                      key={selectedModel.id}
                      src={selectedModel.image}
                      alt={selectedModel.name}
                      width={160}
                      height={160}
                      className="route-enter h-full w-full object-contain"
                    />
                  ) : selectedBrand ? (
                    <BrandLogo
                      brandId={selectedBrand.id}
                      className={
                        selectedBrand.id === 'google' || selectedBrand.id === 'xiaomi'
                          ? 'h-12 w-12'
                          : 'h-8 max-w-[130px]'
                      }
                    />
                  ) : (
                    <MessageSquareText className="h-8 w-8 text-[#2095D3]" />
                  )}
                </div>

                <dl className="divide-y divide-[#F1F5F9] text-xs">
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-[#64748B]">Brand</dt>
                    <dd className="flex items-center gap-2 font-semibold text-[#0F172A]">
                      <span>{selectedBrand ? selectedBrand.name : 'Custom'}</span>
                      <button
                        type="button"
                        onClick={() => navigateToStep(1)}
                        className="cursor-pointer font-mono text-[10px] text-[#187BB2] underline"
                      >
                        Edit
                      </button>
                    </dd>
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-[#64748B]">Model</dt>
                    <dd className="flex items-center gap-2 font-semibold text-[#0F172A]">
                      <span className="max-w-[150px] truncate">
                        {selectedModel
                          ? selectedModel.name
                          : customDeviceName || (isCustomUnlistedDevice ? 'Unlisted' : '—')}
                      </span>
                      {selectedBrand && currentStep !== 2 && (
                        <button
                          type="button"
                          onClick={() => navigateToStep(2)}
                          className="cursor-pointer font-mono text-[10px] text-[#187BB2] underline"
                        >
                          Edit
                        </button>
                      )}
                    </dd>
                  </div>

                  {!isCustomUnlistedDevice && (
                    <div className="flex items-center justify-between py-2.5">
                      <dt className="text-[#64748B]">Storage</dt>
                      <dd className="flex items-center gap-2 font-semibold text-[#0F172A]">
                        <span>{selectedStorage ?? '—'}</span>
                        {selectedStorage && currentStep > 3 && (
                          <button
                            type="button"
                            onClick={() => navigateToStep(3)}
                            className="cursor-pointer font-mono text-[10px] text-[#187BB2] underline"
                          >
                            Edit
                          </button>
                        )}
                      </dd>
                    </div>
                  )}

                  {liveValuation && currentStep >= 4 && !isCustomUnlistedDevice && (
                    <div className="flex items-center justify-between py-2.5">
                      <dt className="text-[#64748B]">Condition</dt>
                      <dd className="flex items-center gap-2 font-semibold text-[#0F172A]">
                        <span className="max-w-[135px] truncate">
                          {liveValuation.appliedTierTitle}
                        </span>
                        {currentStep > 4 && (
                          <button
                            type="button"
                            onClick={() => navigateToStep(4)}
                            className="cursor-pointer font-mono text-[10px] text-[#187BB2] underline"
                          >
                            Edit
                          </button>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 rounded-2xl bg-[#0B1120] p-4.5 text-white">
                  <p className="font-mono text-[10px] tracking-[0.1em] text-slate-400 uppercase">
                    {!liveValuation
                      ? 'Estimate'
                      : liveValuation.isAgentQuote
                        ? 'Custom Quote'
                        : currentStep <= 2
                          ? 'Max Value'
                          : 'Estimated Price'}
                  </p>
                  <p className="mt-1 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-[-0.03em] text-white">
                    {liveValuation ? (
                      liveValuation.isAgentQuote ? (
                        <span className="text-lg text-[#5CC2F8]">Reply by agent</span>
                      ) : currentStep <= 2 ? (
                        <AnimatedAed amount={liveValuation.maxPossibleAed} prefix="Up to " />
                      ) : (
                        <AnimatedAed amount={liveValuation.finalEstimateAed} />
                      )
                    ) : (
                      <span className="text-sm font-semibold text-slate-300">
                        Select model
                      </span>
                    )}
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-xs text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#2095D3]" />
                    <span>Certified data wipe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 shrink-0 text-[#2095D3]" />
                    <span>Free UAE pickup</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default SellPage;
