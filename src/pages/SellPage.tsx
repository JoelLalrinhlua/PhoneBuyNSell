import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Hash,
  MessageSquareText,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import {
  BRANDS,
  CONDITION_TIERS,
  DEFAULT_B2B_ACCOUNT,
  INSPECTION_VIDEO_CONFIG,
  PHONE_MODELS,
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
  BrandId,
  ConditionId,
  PickupSlot,
  SellSubmissionRecord,
  StorageCapacity,
} from '../types/buyback';

/**
 * Streamlined 5-Step Phone Selling Journey:
 *  Step 1: Brand
 *  Step 2: Model
 *  Step 3: Storage
 *  Step 4: Condition
 *  Step 5: Evaluation
 */
type StepNumber = 1 | 2 | 3 | 4 | 5;

const STEPS: { step: StepNumber; label: string; title: string }[] = [
  { step: 1, label: 'Brand', title: 'Select Brand' },
  { step: 2, label: 'Model', title: 'Select Model' },
  { step: 3, label: 'Storage', title: 'Select Storage' },
  { step: 4, label: 'Condition', title: 'Select Condition' },
  { step: 5, label: 'Evaluation', title: 'Phone Evaluation' },
];

const DRAFT_STORAGE_KEY = 'arsouq_sell_draft_v2';
const AUTO_ADVANCE_MS = 160;

interface SellDraftState {
  step: StepNumber;
  brandId: BrandId | 'other' | null;
  modelId: string | null;
  customDeviceName: string;
  storage: StorageCapacity | null;
  colorName: string;
  condition: ConditionId | null;
  quantity: number;
  imeiOrBatchRef: string;
  deviceSpecRegion: 'UAE TDRA' | 'International';
  pickupSlot: PickupSlot;
  notes: string;
}

function readSavedDraft(): SellDraftState | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SellDraftState>;
    if (!parsed || typeof parsed.step !== 'number' || parsed.step < 1 || parsed.step > 5) {
      return null;
    }
    return {
      step: parsed.step as StepNumber,
      brandId: parsed.brandId ?? null,
      modelId: parsed.modelId ?? null,
      customDeviceName: parsed.customDeviceName ?? '',
      storage: parsed.storage ?? null,
      colorName: parsed.colorName ?? '',
      condition: parsed.condition ?? null,
      quantity: typeof parsed.quantity === 'number' && parsed.quantity >= 1 ? parsed.quantity : 1,
      imeiOrBatchRef: parsed.imeiOrBatchRef ?? '',
      deviceSpecRegion:
        parsed.deviceSpecRegion === 'International' ? 'International' : 'UAE TDRA',
      pickupSlot: parsed.pickupSlot ?? 'tomorrow-morning',
      notes: parsed.notes ?? '',
    };
  } catch {
    return null;
  }
}

interface SellFlowProps {
  searchParams: URLSearchParams;
}

const SellPageFlow: React.FC<SellFlowProps> = ({ searchParams }) => {
  const advanceTimerRef = useRef<number | null>(null);

  const initialSetup = useMemo((): SellDraftState => {
    const brandParam = searchParams.get('brand') as BrandId | null;
    const modelParam = searchParams.get('model');

    const validBrand = BRANDS.find((b) => b.id === brandParam) ?? null;
    const validModel = modelParam
      ? (PHONE_MODELS.find((m) => m.id === modelParam) ?? null)
      : null;

    if (validModel) {
      return {
        step: 3,
        brandId: validModel.brandId,
        modelId: validModel.id,
        customDeviceName: '',
        storage: validModel.storageOptions[0].capacity,
        colorName: validModel.colors[0]?.name ?? 'Standard',
        condition: null,
        quantity: 1,
        imeiOrBatchRef: '',
        deviceSpecRegion: 'UAE TDRA',
        pickupSlot: 'tomorrow-morning',
        notes: '',
      };
    }

    if (validBrand) {
      return {
        step: 2,
        brandId: validBrand.id,
        modelId: null,
        customDeviceName: '',
        storage: null,
        colorName: '',
        condition: null,
        quantity: 1,
        imeiOrBatchRef: '',
        deviceSpecRegion: 'UAE TDRA',
        pickupSlot: 'tomorrow-morning',
        notes: '',
      };
    }

    const saved = readSavedDraft();
    if (saved) return saved;

    return {
      step: 1,
      brandId: null,
      modelId: null,
      customDeviceName: '',
      storage: null,
      colorName: '',
      condition: null,
      quantity: 1,
      imeiOrBatchRef: '',
      deviceSpecRegion: 'UAE TDRA',
      pickupSlot: 'tomorrow-morning',
      notes: '',
    };
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState<StepNumber>(initialSetup.step);
  const [transitionDir, setTransitionDir] = useState<'forward' | 'backward'>('forward');

  const [selectedBrandId, setSelectedBrandId] = useState<BrandId | 'other' | null>(
    initialSetup.brandId
  );
  const [selectedModelId, setSelectedModelId] = useState<string | null>(initialSetup.modelId);
  const [customDeviceName, setCustomDeviceName] = useState(initialSetup.customDeviceName);
  const [selectedStorage, setSelectedStorage] = useState<StorageCapacity | null>(
    initialSetup.storage
  );
  const [selectedColor, setSelectedColor] = useState<string>(initialSetup.colorName);
  const [selectedCondition, setSelectedCondition] = useState<ConditionId | null>(
    initialSetup.condition
  );

  const [modelQuery, setModelQuery] = useState('');
  const [seriesFilter, setSeriesFilter] = useState<string>('all');
  const [showInspectionTips, setShowInspectionTips] = useState(false);

  const [quantity, setQuantity] = useState<number>(initialSetup.quantity);
  const [imeiOrBatchRef, setImeiOrBatchRef] = useState(initialSetup.imeiOrBatchRef);
  const [deviceSpecRegion, setDeviceSpecRegion] = useState<'UAE TDRA' | 'International'>(
    initialSetup.deviceSpecRegion
  );
  const [pickupSlot, setPickupSlot] = useState<PickupSlot>(initialSetup.pickupSlot);
  const [notes, setNotes] = useState(initialSetup.notes);
  const [showOptionalNotes, setShowOptionalNotes] = useState(Boolean(initialSetup.notes));
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

  const navigateToStep = (target: StepNumber) => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    setTransitionDir(target >= currentStep ? 'forward' : 'backward');
    setCurrentStep(target);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentStep]);

  // Persist sell draft in sessionStorage so opening User Dashboard preserves selections
  useEffect(() => {
    if (submittedRecord) return;
    try {
      const draft: SellDraftState = {
        step: currentStep,
        brandId: selectedBrandId,
        modelId: selectedModelId,
        customDeviceName,
        storage: selectedStorage,
        colorName: selectedColor,
        condition: selectedCondition,
        quantity,
        imeiOrBatchRef,
        deviceSpecRegion,
        pickupSlot,
        notes,
      };
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage quota issues
    }
  }, [
    submittedRecord,
    currentStep,
    selectedBrandId,
    selectedModelId,
    customDeviceName,
    selectedStorage,
    selectedColor,
    selectedCondition,
    quantity,
    imeiOrBatchRef,
    deviceSpecRegion,
    pickupSlot,
    notes,
  ]);

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
      return calculateValuation(null, null, 'others-agent', quantity);
    }
    if (!selectedModel) return null;
    const activeStorage = selectedStorage ?? selectedModel.storageOptions[0].capacity;
    return calculateValuation(
      selectedModel,
      activeStorage,
      activeConditionForCalc,
      quantity
    );
  }, [isCustomUnlistedDevice, selectedModel, selectedStorage, activeConditionForCalc, quantity]);

  const canNavigateToStep = (target: StepNumber): boolean => {
    if (submittedRecord) return false;
    if (target === 1) return true;
    if (isCustomUnlistedDevice) {
      return target === 5 || (target === 2 && selectedBrandId !== 'other');
    }
    if (target === 2) return Boolean(selectedBrandId);
    if (target === 3) return Boolean(selectedBrandId && selectedModelId);
    if (target === 4) return Boolean(selectedBrandId && selectedModelId && selectedStorage);
    if (target === 5) {
      return Boolean(
        selectedBrandId && selectedModelId && selectedStorage && selectedCondition
      );
    }
    return false;
  };

  const handleSelectBrand = (brandId: BrandId) => {
    if (brandId !== selectedBrandId) {
      setSelectedBrandId(brandId);
      setSelectedModelId(null);
      setSelectedStorage(null);
      setSelectedColor('');
      setSelectedCondition(null);
      setSeriesFilter('all');
      setModelQuery('');
    } else if (selectedModelId === 'other-device') {
      setSelectedModelId(null);
      setSelectedCondition(null);
    }
    scheduleAutoAdvance(() => setCurrentStep(2));
  };

  const handleSelectOtherUnlistedDevice = () => {
    setSelectedBrandId((prev) => prev ?? 'other');
    setSelectedModelId('other-device');
    setSelectedCondition('others-agent');
    scheduleAutoAdvance(() => setCurrentStep(5));
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

    if (selectedCondition === 'others-agent' && isCustomUnlistedDevice) {
      setSelectedCondition(null);
    }

    scheduleAutoAdvance(() => setCurrentStep(3));
  };

  const handleSelectStorage = (capacity: StorageCapacity) => {
    setSelectedStorage(capacity);
    scheduleAutoAdvance(() => setCurrentStep(4));
  };

  const handleSelectCondition = (condId: ConditionId) => {
    setSelectedCondition(condId);
    scheduleAutoAdvance(() => setCurrentStep(5));
  };

  const handleStepBack = () => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    setTransitionDir('backward');

    if (currentStep === 5 && isCustomUnlistedDevice) {
      setCurrentStep(selectedBrandId && selectedBrandId !== 'other' ? 2 : 1);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepNumber);
    }
  };

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => Math.min(500, Math.max(1, prev + delta)));
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveValuation) return;

    const errors: Record<string, string> = {};
    if (isCustomUnlistedDevice && customDeviceName.trim().length < 2) {
      errors.customDeviceName = 'Enter the brand, model, and storage.';
    }
    if (imeiOrBatchRef.trim().length < 5) {
      errors.imeiOrBatchRef =
        quantity > 1
          ? 'Enter a batch reference or primary IMEI.'
          : 'Enter a valid 15-digit IMEI or serial number.';
    }
    if (liveValuation.isAgentQuote && notes.trim().length < 4) {
      errors.notes = 'Briefly describe the phone condition for our specialist.';
    }

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
      valuation: liveValuation,
      account: DEFAULT_B2B_ACCOUNT,
      saleDetails: {
        quantity,
        imeiOrBatchRef: imeiOrBatchRef.trim(),
        deviceSpecRegion,
        pickupSlot,
        notes: notes.trim() || undefined,
      },
    });

    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }

    setSubmittedRecord(saved);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleResetAnotherPhone = () => {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setSubmittedRecord(null);
    setSelectedBrandId(null);
    setSelectedModelId(null);
    setCustomDeviceName('');
    setSelectedStorage(null);
    setSelectedColor('');
    setSelectedCondition(null);
    setQuantity(1);
    setImeiOrBatchRef('');
    setNotes('');
    setShowOptionalNotes(false);
    setFormErrors({});
    setTransitionDir('forward');
    setCurrentStep(1);
  };

  const getStepSummaryCaption = (step: StepNumber): string => {
    switch (step) {
      case 1:
        if (selectedBrand) return selectedBrand.name;
        if (selectedBrandId === 'other') return 'Custom';
        return 'Select';
      case 2:
        if (selectedModel) return selectedModel.name;
        if (isCustomUnlistedDevice) return customDeviceName || 'Unlisted';
        return '—';
      case 3:
        if (isCustomUnlistedDevice) return 'Custom';
        return selectedStorage ?? '—';
      case 4: {
        if (isCustomUnlistedDevice) return 'Agent Quote';
        if (!selectedCondition) return '—';
        return (
          CONDITION_TIERS.find((t) => t.id === selectedCondition)?.shortLabel ?? 'Selected'
        );
      }
      case 5:
        if (!liveValuation) return '—';
        if (liveValuation.isAgentQuote) return 'Quote';
        if (selectedCondition) return formatAed(liveValuation.finalEstimateAed);
        return formatAed(liveValuation.storageBaseAed);
    }
  };

  const slideAnimationClass =
    transitionDir === 'forward' ? 'step-slide-forward' : 'step-slide-backward';

  // =========================================================================
  // SUBMITTED SELL ORDER RECEIPT VIEW
  // =========================================================================
  if (submittedRecord) {
    const slotLabel =
      submittedRecord.saleDetails.pickupSlot === 'today-evening'
        ? 'Today · 6:00 PM – 9:00 PM'
        : submittedRecord.saleDetails.pickupSlot === 'tomorrow-morning'
          ? 'Tomorrow · 10:00 AM – 1:00 PM'
          : 'Tomorrow · 5:00 PM – 9:00 PM';

    return (
      <main
        id="main-content"
        className="min-h-[calc(100svh-3.5rem)] bg-[#F6F8FB] py-5 sm:min-h-[calc(100svh-4rem)] sm:py-10"
      >
        <div className="step-slide-forward mx-auto max-w-2xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:rounded-3xl">
            <div className="bg-[#0B1120] p-5 text-white sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2095D3]/20 px-3 py-1 font-mono text-[11px] font-semibold text-[#5CC2F8]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {submittedRecord.valuation.isAgentQuote
                    ? 'Evaluation Requested'
                    : 'Sell Order Confirmed'}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  Ref: <strong className="text-white">{submittedRecord.referenceCode}</strong>
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.08em] text-slate-400 uppercase">
                    {submittedRecord.valuation.isAgentQuote
                      ? 'Evaluation Status'
                      : 'Evaluated Payout'}
                  </p>
                  <p className="mt-0.5 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-[-0.03em] text-white tabular-nums sm:text-4xl">
                    {submittedRecord.valuation.isAgentQuote
                      ? 'Reply by Agent'
                      : formatAed(submittedRecord.valuation.finalEstimateAed)}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    {submittedRecord.saleDetails.quantity} &times; {submittedRecord.brandName}{' '}
                    {submittedRecord.modelName}
                    {submittedRecord.storage !== 'Custom'
                      ? ` · ${submittedRecord.storage} · ${submittedRecord.colorName}`
                      : ''}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[11px] text-slate-400">Condition</p>
                  <p className="text-xs font-semibold text-white">
                    {submittedRecord.conditionTitle}
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-400">IMEI / Ref</p>
                  <p className="font-mono text-xs font-semibold text-white">
                    {submittedRecord.saleDetails.imeiOrBatchRef}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-4 border-b border-[#E2E8F0] pb-4 text-xs sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[10.5px] font-semibold text-[#64748B] uppercase">
                    Collection Slot
                  </p>
                  <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                    {slotLabel}
                  </p>
                  <p className="mt-0.5 text-[#64748B]">
                    {submittedRecord.account.registeredAddress}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[10.5px] font-semibold text-[#64748B] uppercase">
                    Payout Account
                  </p>
                  <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0F172A]">
                    {submittedRecord.account.contactPerson}
                  </p>
                  <p className="mt-0.5 font-mono text-[#64748B]">
                    {submittedRecord.account.maskedIban}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-press inline-flex h-9.5 cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#0F172A] hover:border-[#2095D3]"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAnotherPhone}
                    className="btn-press inline-flex h-9.5 cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#0F172A] hover:border-[#2095D3]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Sell Another
                  </button>
                </div>

                <Link
                  to="/dashboard"
                  className="btn-press inline-flex h-9.5 items-center rounded-full bg-[#2095D3] px-5 text-xs font-semibold text-white hover:bg-[#187BB2]"
                >
                  View in Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================================
  // COMPACT 5-STEP PHONE SELLING VIEW + BOTTOM SCREEN PROGRESSION BARS
  // =========================================================================
  return (
    <main
      id="main-content"
      className="route-enter min-h-[calc(100svh-3.5rem)] overflow-x-clip bg-[#F6F8FB] pb-24 sm:min-h-[calc(100svh-4rem)] sm:pb-28"
    >
      <div className="mx-auto max-w-[1280px] px-3.5 pt-3 sm:px-8 sm:pt-6 lg:px-10">
        {/* =================================================================
            STEP 1: BRAND
           ================================================================= */}
        {currentStep === 1 && (
          <section key="step-1" className={slideAnimationClass}>
            <div className="mb-3 flex items-baseline justify-between gap-2 sm:mb-4">
              <div>
                <h1 className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                  Select brand
                </h1>
                <p className="text-xs text-[#64748B]">
                  Tap your smartphone manufacturer to begin.
                </p>
              </div>
              <span className="font-mono text-[11px] font-semibold text-[#64748B]">
                01 / 05
              </span>
            </div>

            <div
              className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6"
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
                    className={`card-lift group relative flex h-[66px] cursor-pointer items-center justify-center rounded-xl border px-2 py-2 sm:h-22 sm:rounded-2xl sm:p-4 ${
                      isSelected
                        ? 'border-[#2095D3] bg-white ring-2 ring-[#2095D3]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#2095D3]'
                    }`}
                  >
                    <span
                      className={`absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full border sm:top-2 sm:right-2 sm:h-4.5 sm:w-4.5 ${
                        isSelected
                          ? 'check-pop border-[#2095D3] bg-[#2095D3] text-white'
                          : 'border-[#E2E8F0] bg-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5" />}
                    </span>

                    <BrandLogo
                      brandId={brand.id}
                      className={
                        brand.id === 'google' || brand.id === 'xiaomi'
                          ? 'h-7 w-7 transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10'
                          : 'h-5 max-w-[82px] transition-transform duration-200 group-hover:scale-105 sm:h-6.5 sm:max-w-[115px]'
                      }
                    />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSelectOtherUnlistedDevice}
              className="card-lift mt-2.5 flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-left hover:border-[#2095D3] sm:mt-3.5 sm:rounded-2xl sm:px-5 sm:py-3.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <MessageSquareText className="h-4 w-4 shrink-0 text-[#2095D3]" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#0F172A] sm:text-sm">
                    Other brand — Device not listed
                  </p>
                  <p className="truncate text-[11px] text-[#64748B]">
                    Submit unlisted phone details for an agent quote
                  </p>
                </div>
              </div>
              <span className="shrink-0 font-mono text-[11px] font-semibold text-[#187BB2]">
                Quote &rarr;
              </span>
            </button>
          </section>
        )}

        {/* =================================================================
            STEPS 2..4 WITH COMPACT MOBILE LAYOUT & DESKTOP SUMMARY RAIL
           ================================================================= */}
        {currentStep >= 2 && currentStep <= 4 && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="min-w-0 lg:col-span-8">
              {/* =============================================================
                  STEP 2: MODEL
                 ============================================================= */}
              {currentStep === 2 && (
                <section key="step-2" className={slideAnimationClass}>
                  <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={handleStepBack}
                        aria-label="Back to Brand"
                        className="btn-press flex h-8.5 w-8.5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#2095D3]"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <h1 className="truncate font-['Plus_Jakarta_Sans'] text-lg font-extrabold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                        Select {selectedBrand?.name} model
                      </h1>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateToStep(1)}
                      className="btn-press shrink-0 cursor-pointer rounded-full border border-[#CBD5E1] bg-white px-3 py-1 text-[11px] font-semibold text-[#0F172A] hover:border-[#2095D3]"
                    >
                      {selectedBrand?.name ?? 'Brand'}
                    </button>
                  </div>

                  {/* Compact Search + Series Filter */}
                  <div className="mb-2.5 space-y-2 sm:mb-3.5">
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
                        className="h-10 w-full rounded-xl border border-[#CBD5E1] bg-white pr-9 pl-9.5 text-base text-[#0F172A] placeholder:text-slate-400 focus:border-[#2095D3] focus:outline-none sm:h-11 sm:text-sm"
                      />
                      {modelQuery && (
                        <button
                          type="button"
                          onClick={() => setModelQuery('')}
                          aria-label="Clear search"
                          className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#64748B] hover:bg-slate-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {!modelQuery && availableSeries.length > 1 && (
                      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <button
                          type="button"
                          onClick={() => setSeriesFilter('all')}
                          className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold ${
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
                            className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold ${
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

                  {/* Compact Phone Model Grid — Fits Cleanly on Mobile Viewport */}
                  <div
                    className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3"
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
                          className={`card-lift group relative flex cursor-pointer flex-col justify-between rounded-xl border bg-white p-2.5 text-left sm:rounded-2xl sm:p-3.5 ${
                            isSelected
                              ? 'border-[#2095D3] ring-2 ring-[#2095D3]'
                              : 'border-[#E2E8F0] hover:border-[#2095D3]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 sm:my-1.5 sm:h-22 sm:justify-center">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] p-1 sm:h-full sm:w-full sm:bg-transparent sm:p-0">
                              <img
                                src={model.image}
                                alt={model.name}
                                width={140}
                                height={140}
                                loading="lazy"
                                decoding="async"
                                className="img-zoom h-full w-full object-contain"
                              />
                            </div>

                            <div className="text-right sm:hidden">
                              <span className="block text-[9.5px] font-medium text-[#64748B]">
                                Up to
                              </span>
                              <span className="font-mono text-[11px] font-bold text-[#187BB2] tabular-nums">
                                {formatAed(maxVal)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-1.5 sm:mt-2">
                            <p className="truncate font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0F172A] sm:text-sm">
                              {model.name}
                            </p>
                            <p className="truncate text-[10px] text-[#64748B] sm:mt-0.5 sm:text-[11px]">
                              {model.storageOptions.map((s) => s.capacity).join(' · ')}
                            </p>
                            <p className="mt-2 hidden border-t border-[#F1F5F9] pt-1.5 font-mono text-xs font-bold text-[#187BB2] tabular-nums sm:block">
                              Up to {formatAed(maxVal)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectOtherUnlistedDevice}
                    className="card-lift mt-2 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-[#CBD5E1] bg-white/80 px-3.5 py-2.5 text-left hover:border-[#2095D3] hover:bg-white sm:mt-3"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                      <MessageSquareText className="h-4 w-4 shrink-0 text-[#2095D3]" />
                      <span>Model not listed? Request agent quote</span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] font-semibold text-[#187BB2]">
                      &rarr;
                    </span>
                  </button>
                </section>
              )}

              {/* =============================================================
                  STEP 3: STORAGE
                 ============================================================= */}
              {currentStep === 3 && selectedModel && (
                <section key="step-3" className={slideAnimationClass}>
                  <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={handleStepBack}
                        aria-label="Back to Model"
                        className="btn-press flex h-8.5 w-8.5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#2095D3]"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <h1 className="truncate font-['Plus_Jakarta_Sans'] text-lg font-extrabold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                        Select storage
                      </h1>
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-[#64748B]">
                      03 / 05
                    </span>
                  </div>

                  {/* Selected Phone Compact Strip */}
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-2.5 sm:rounded-2xl sm:p-3.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <img
                        src={selectedModel.image}
                        alt={selectedModel.name}
                        width={44}
                        height={44}
                        className="h-10 w-10 shrink-0 rounded-lg bg-[#F8FAFC] object-contain p-1"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0F172A] sm:text-sm">
                          {selectedModel.name}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          {selectedBrand?.name} · Choose capacity below
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateToStep(2)}
                      className="shrink-0 cursor-pointer rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-[#187BB2] hover:border-[#2095D3]"
                    >
                      Change
                    </button>
                  </div>

                  {/* Compact Color Swatch Row (Optional) */}
                  {selectedModel.colors.length > 0 && (
                    <div className="mb-3 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 sm:rounded-2xl sm:p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#64748B]">
                          Finish (Optional)
                        </span>
                        <span className="font-mono text-[11px] font-medium text-[#0F172A]">
                          {selectedColor}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
                        {selectedModel.colors.map((c) => {
                          const active = selectedColor === c.name;
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => setSelectedColor(c.name)}
                              className={`btn-press flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                                active
                                  ? 'border-[#2095D3] bg-[#F0F8FD] font-semibold text-[#0F172A]'
                                  : 'border-[#E2E8F0] bg-white text-[#64748B]'
                              }`}
                            >
                              <span
                                style={{ backgroundColor: c.hex }}
                                className="h-2.5 w-2.5 rounded-full border border-black/15"
                              />
                              <span>{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Storage Capacity Tiles */}
                  <div
                    className="grid grid-cols-2 gap-2.5 sm:gap-3.5"
                    role="radiogroup"
                    aria-label="Phone storage capacity"
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
                          className={`card-lift flex min-h-[72px] cursor-pointer items-center justify-between rounded-xl border bg-white p-3.5 text-left sm:min-h-[84px] sm:rounded-2xl sm:p-5 ${
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
                              Up to {formatAed(tierMaxPrice)}
                            </p>
                          </div>

                          <span
                            className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border sm:h-6 sm:w-6 ${
                              isSelected
                                ? 'check-pop border-[#2095D3] bg-[#2095D3] text-white'
                                : 'border-[#CBD5E1] bg-white'
                            }`}
                          >
                            {isSelected ? (
                              <Check className="h-3 w-3" />
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

              {/* =============================================================
                  STEP 4: CONDITION
                 ============================================================= */}
              {currentStep === 4 && selectedModel && selectedStorage && (
                <section key="step-4" className={slideAnimationClass}>
                  <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={handleStepBack}
                        aria-label="Back to Storage"
                        className="btn-press flex h-8.5 w-8.5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#2095D3]"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <div className="min-w-0">
                        <h1 className="truncate font-['Plus_Jakarta_Sans'] text-lg font-extrabold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                          Select condition
                        </h1>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowInspectionTips(true)}
                      className="btn-press inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-[#CBD5E1] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#187BB2] hover:border-[#2095D3]"
                    >
                      <CircleHelp className="h-3.5 w-3.5" />
                      <span>How to check</span>
                    </button>
                  </div>

                  {/* Compact All-7-Tiers List — Designed to Fit Mobile Screen Without Heavy Scroll */}
                  <div className="space-y-1.5 sm:space-y-2" role="radiogroup" aria-label="Phone condition">
                    {CONDITION_TIERS.map((tier) => {
                      const isSelected = selectedCondition === tier.id;
                      const previewVal = calculateValuation(
                        selectedModel,
                        selectedStorage,
                        tier.id,
                        1
                      );

                      return (
                        <button
                          key={tier.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleSelectCondition(tier.id)}
                          className={`card-lift group flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl border bg-white px-3 py-2.5 text-left sm:rounded-2xl sm:px-4 sm:py-3.5 ${
                            isSelected
                              ? 'border-[#2095D3] bg-[#F8FCFF] ring-2 ring-[#2095D3]'
                              : 'border-[#E2E8F0] hover:border-[#2095D3]'
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 items-start gap-2.5">
                            <span
                              style={{ backgroundColor: tier.indicatorHex }}
                              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                            />
                            <div className="min-w-0 flex-1">
                              <h2 className="truncate font-['Plus_Jakarta_Sans'] text-[13px] font-bold text-[#0F172A] sm:text-sm">
                                {tier.title}
                              </h2>
                              <p className="line-clamp-1 text-[11px] leading-snug text-[#64748B] sm:line-clamp-none sm:text-xs">
                                {tier.summary}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5 text-right sm:gap-2.5">
                            <div>
                              <span className="block font-mono text-xs font-extrabold text-[#187BB2] tabular-nums sm:text-sm">
                                {tier.deductionAed === null
                                  ? 'Agent quote'
                                  : formatAed(previewVal.unitEstimateAed)}
                              </span>
                              <span className="block font-mono text-[10px] font-medium text-[#64748B]">
                                {tier.deductionAed === null
                                  ? 'Custom review'
                                  : tier.deductionAed === 0
                                    ? 'Full value'
                                    : `-AED ${tier.deductionAed.toLocaleString('en-US')}`}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-[#94A3B8] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#2095D3]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* DESKTOP STICKY SUMMARY RAIL (Steps 2–4) */}
            <aside className="hidden lg:sticky lg:top-22 lg:col-span-4 lg:block">
              <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
                  <span className="font-mono text-[11px] font-semibold text-[#64748B] uppercase">
                    Live Selection
                  </span>
                  <span className="font-mono text-[11px] font-medium text-[#64748B]">
                    0{currentStep} / 05
                  </span>
                </div>

                <div className="my-3.5 flex h-32 items-center justify-center rounded-2xl bg-[#F6F8FB] p-3.5">
                  {selectedModel ? (
                    <img
                      key={selectedModel.id}
                      src={selectedModel.image}
                      alt={selectedModel.name}
                      width={140}
                      height={140}
                      className="route-enter h-full w-full object-contain"
                    />
                  ) : selectedBrand ? (
                    <BrandLogo
                      brandId={selectedBrand.id}
                      className={
                        selectedBrand.id === 'google' || selectedBrand.id === 'xiaomi'
                          ? 'h-11 w-11'
                          : 'h-7 max-w-[125px]'
                      }
                    />
                  ) : (
                    <MessageSquareText className="h-8 w-8 text-[#2095D3]" />
                  )}
                </div>

                <dl className="divide-y divide-[#F1F5F9] text-xs">
                  <div className="flex items-center justify-between py-2">
                    <dt className="text-[#64748B]">Brand</dt>
                    <dd className="font-semibold text-[#0F172A]">
                      {selectedBrand ? selectedBrand.name : 'Custom'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <dt className="text-[#64748B]">Model</dt>
                    <dd className="max-w-[165px] truncate font-semibold text-[#0F172A]">
                      {selectedModel ? selectedModel.name : '—'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <dt className="text-[#64748B]">Storage</dt>
                    <dd className="font-mono font-semibold text-[#0F172A]">
                      {selectedStorage ?? '—'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <dt className="text-[#64748B]">Condition</dt>
                    <dd className="max-w-[165px] truncate font-semibold text-[#0F172A]">
                      {selectedCondition
                        ? (CONDITION_TIERS.find((t) => t.id === selectedCondition)?.shortLabel ??
                          '—')
                        : '—'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3.5 rounded-2xl bg-[#0B1120] p-4 text-white">
                  <p className="font-mono text-[10px] tracking-[0.1em] text-slate-400 uppercase">
                    {selectedCondition ? 'Evaluated Value' : 'Maximum Value'}
                  </p>
                  <p className="mt-0.5 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-[-0.03em] text-white">
                    {liveValuation ? (
                      liveValuation.isAgentQuote ? (
                        <span className="text-lg text-[#5CC2F8]">Reply by agent</span>
                      ) : selectedCondition ? (
                        <AnimatedAed amount={liveValuation.finalEstimateAed} />
                      ) : (
                        <AnimatedAed amount={liveValuation.maxPossibleAed} prefix="Up to " />
                      )
                    ) : (
                      <span className="text-sm font-semibold text-slate-300">Select model</span>
                    )}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* =================================================================
            STEP 5: EVALUATION (Compact Offer Breakdown + Quick Sell Confirm)
           ================================================================= */}
        {currentStep === 5 && liveValuation && (
          <section key="step-5" className={slideAnimationClass}>
            <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-4">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleStepBack}
                  aria-label="Previous step"
                  className="btn-press flex h-8.5 w-8.5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#2095D3]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="truncate font-['Plus_Jakarta_Sans'] text-lg font-extrabold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                  Phone evaluation
                </h1>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-[#EBF7FD] px-2.5 py-1 font-mono text-[10.5px] font-semibold text-[#187BB2]">
                <Sparkles className="h-3 w-3" />
                7-Day Lock
              </span>
            </div>

            <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-12 lg:gap-6">
              {/* Left Column on Desktop / Top Card on Phone: Evaluated Price & Summary */}
              <div className="min-w-0 space-y-2.5 lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:rounded-3xl">
                  <div className="bg-[#0B1120] p-4 text-white sm:p-5">
                    <div className="flex items-center gap-3">
                      {selectedModel && (
                        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 sm:h-15 sm:w-15">
                          <img
                            src={selectedModel.image}
                            alt={selectedModel.name}
                            width={60}
                            height={60}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-300">
                          {selectedModel
                            ? `${selectedBrand?.name ?? ''} ${selectedModel.name} · ${selectedStorage}`
                            : customDeviceName || 'Custom Unlisted Phone'}
                        </p>
                        <p className="mt-0.5 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-[-0.03em] text-white tabular-nums sm:text-3xl">
                          {liveValuation.isAgentQuote ? (
                            <span className="text-xl text-[#5CC2F8]">Reply by Agent</span>
                          ) : (
                            <AnimatedAed amount={liveValuation.finalEstimateAed} />
                          )}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                          <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-[#5CC2F8]">
                            {liveValuation.appliedTierTitle}
                          </span>
                          {!liveValuation.isAgentQuote && quantity > 1 && (
                            <span className="font-mono text-[10.5px] text-slate-300 tabular-nums">
                              {formatAed(liveValuation.unitEstimateAed)} &times; {quantity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Valuation Breakdown */}
                  {!liveValuation.isAgentQuote && (
                    <div className="divide-y divide-[#F1F5F9] bg-[#F8FAFC] px-4 py-2.5 text-xs">
                      {liveValuation.lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 py-1.5"
                        >
                          <span className="truncate text-[#475569]">{item.label}</span>
                          <span
                            className={`shrink-0 font-mono font-semibold tabular-nums ${
                              item.kind === 'deduction' ? 'text-[#DC2626]' : 'text-[#0F172A]'
                            }`}
                          >
                            {item.amountAed >= 0
                              ? formatAed(item.amountAed)
                              : `-${formatAed(Math.abs(item.amountAed))}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compact Linked User Account Bar (Full Info Lives in Top-Right Profile Dashboard) */}
                <Link
                  to="/dashboard"
                  className="flex items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs transition-colors hover:border-[#2095D3]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <User className="h-4 w-4 shrink-0 text-[#2095D3]" />
                    <span className="truncate font-medium text-[#0F172A]">
                      {DEFAULT_B2B_ACCOUNT.contactPerson} ·{' '}
                      <span className="text-[#64748B]">
                        {DEFAULT_B2B_ACCOUNT.tradeLicenseEmirate}
                      </span>
                    </span>
                  </div>
                  <span className=" inline-flex shrink-0 items-center gap-0.5 font-semibold text-[#187BB2]">
                    <span>My Info</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>

              {/* Right Column on Desktop / Compact Confirmation Card on Phone */}
              <form
                onSubmit={validateAndSubmit}
                noValidate
                className="min-w-0 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.03)] sm:rounded-3xl sm:p-5 lg:col-span-7"
              >
                <div className="space-y-3">
                  {isCustomUnlistedDevice && (
                    <div>
                      <label
                        htmlFor="custom-device-name"
                        className="block text-[11px] font-semibold text-[#0F172A]"
                      >
                        Brand, Model &amp; Storage *
                      </label>
                      <input
                        id="custom-device-name"
                        type="text"
                        value={customDeviceName}
                        onChange={(e) => setCustomDeviceName(e.target.value)}
                        placeholder="e.g. Honor Magic6 Pro 512 GB"
                        className="mt-1 h-10 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-base text-[#0F172A] focus:border-[#2095D3] focus:outline-none sm:text-sm"
                      />
                      {formErrors.customDeviceName && (
                        <p className="mt-1 text-[11px] font-medium text-[#DC2626]">
                          {formErrors.customDeviceName}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Row 1: Quantity + Region Spec */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="sale-quantity"
                        className="block text-[11px] font-semibold text-[#0F172A]"
                      >
                        Quantity
                      </label>
                      <div className="mt-1 flex h-10 items-center rounded-xl border border-[#CBD5E1] bg-white px-1.5">
                        <button
                          type="button"
                          onClick={() => adjustQuantity(-1)}
                          aria-label="Decrease quantity"
                          className="flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-lg text-[#0F172A] hover:bg-[#F6F8FB]"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          id="sale-quantity"
                          type="number"
                          min={1}
                          max={500}
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              Math.min(500, Math.max(1, parseInt(e.target.value, 10) || 1))
                            )
                          }
                          className="w-full bg-transparent text-center font-mono text-base font-bold text-[#0F172A] focus:outline-none sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => adjustQuantity(1)}
                          aria-label="Increase quantity"
                          className="flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-lg text-[#0F172A] hover:bg-[#F6F8FB]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-[#0F172A]">
                        Region Spec
                      </span>
                      <div className="mt-1 grid h-10 grid-cols-2 gap-1.5">
                        {(['UAE TDRA', 'International'] as const).map((reg) => (
                          <button
                            key={reg}
                            type="button"
                            onClick={() => setDeviceSpecRegion(reg)}
                            className={`btn-press cursor-pointer rounded-xl border px-1.5 text-[11px] font-semibold ${
                              deviceSpecRegion === reg
                                ? 'border-[#2095D3] bg-[#2095D3] text-white'
                                : 'border-[#CBD5E1] bg-white text-[#64748B]'
                            }`}
                          >
                            {reg === 'International' ? "Int'l" : 'UAE TDRA'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: IMEI or Batch Ref */}
                  <div>
                    <label
                      htmlFor="imei-batch-ref"
                      className="block text-[11px] font-semibold text-[#0F172A]"
                    >
                      {quantity > 1 ? 'Batch Ref / Primary IMEI *' : 'IMEI or Serial No. *'}
                    </label>
                    <div className="relative mt-1">
                      <Hash className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
                      <input
                        id="imei-batch-ref"
                        type="text"
                        value={imeiOrBatchRef}
                        onChange={(e) => setImeiOrBatchRef(e.target.value)}
                        placeholder={
                          quantity > 1
                            ? 'Batch reference or primary IMEI'
                            : '15-digit IMEI (*#06#) or Serial No.'
                        }
                        className="h-10 w-full rounded-xl border border-[#CBD5E1] bg-white pr-3.5 pl-8.5 font-mono text-base text-[#0F172A] placeholder:font-sans placeholder:text-xs placeholder:text-slate-400 focus:border-[#2095D3] focus:outline-none sm:text-xs"
                      />
                    </div>
                    {formErrors.imeiOrBatchRef && (
                      <p className="mt-1 text-[11px] font-medium text-[#DC2626]">
                        {formErrors.imeiOrBatchRef}
                      </p>
                    )}
                  </div>

                  {/* Row 3: Compact 3-Column Pickup Slot Selector */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 text-[#2095D3]" />
                      <span className="text-[11px] font-semibold text-[#0F172A]">
                        Free Collection Slot
                      </span>
                    </div>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5 sm:gap-2">
                      {(
                        [
                          {
                            id: 'today-evening' as PickupSlot,
                            day: 'Today',
                            hours: '6–9 PM',
                          },
                          {
                            id: 'tomorrow-morning' as PickupSlot,
                            day: 'Tmrw AM',
                            hours: '10–1 PM',
                          },
                          {
                            id: 'tomorrow-evening' as PickupSlot,
                            day: 'Tmrw PM',
                            hours: '5–9 PM',
                          },
                        ] as const
                      ).map((slot) => {
                        const active = pickupSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setPickupSlot(slot.id)}
                            className={`btn-press cursor-pointer rounded-xl border px-2 py-2 text-center transition-colors ${
                              active
                                ? 'border-[#2095D3] bg-[#F0F8FD] ring-1 ring-[#2095D3]'
                                : 'border-[#E2E8F0] bg-white hover:border-[#2095D3]'
                            }`}
                          >
                            <span className="block font-['Plus_Jakarta_Sans'] text-[11px] font-bold text-[#0F172A] sm:text-xs">
                              {slot.day}
                            </span>
                            <span className="block font-mono text-[10px] text-[#64748B]">
                              {slot.hours}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes (Always visible for Agent Quote, compact toggle otherwise) */}
                  {liveValuation.isAgentQuote || showOptionalNotes ? (
                    <div>
                      <label
                        htmlFor="sale-notes"
                        className="block text-[11px] font-semibold text-[#0F172A]"
                      >
                        {liveValuation.isAgentQuote
                          ? 'Condition & Issue Details *'
                          : 'Pickup / PO Note (Optional)'}
                      </label>
                      <textarea
                        id="sale-notes"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={
                          liveValuation.isAgentQuote
                            ? 'Describe screen, body, battery %, or hardware issues...'
                            : 'Optional PO number or courier gate note...'
                        }
                        className="mt-1 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-base text-[#0F172A] focus:border-[#2095D3] focus:outline-none sm:text-xs"
                      />
                      {formErrors.notes && (
                        <p className="mt-1 text-[11px] font-medium text-[#DC2626]">
                          {formErrors.notes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowOptionalNotes(true)}
                      className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-[#64748B] hover:text-[#2095D3]"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add optional note or PO reference</span>
                    </button>
                  )}

                  {/* Primary Confirm CTA */}
                  <button
                    type="submit"
                    className="btn-press flex h-11.5 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#2095D3] px-6 text-xs font-bold tracking-[0.04em] text-white uppercase shadow-[0_8px_20px_rgba(32,149,211,0.26)] hover:bg-[#187BB2] sm:h-12 sm:text-sm"
                  >
                    <span>
                      {liveValuation.isAgentQuote
                        ? 'Submit for Agent Evaluation'
                        : `Confirm & Sell · ${formatAed(liveValuation.finalEstimateAed)}`}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>

      {/* ===================================================================
          QUICK INSPECTION TIPS SHEET (On-Demand Modal from Step 4 Condition)
         =================================================================== */}
      {showInspectionTips && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Phone inspection guide"
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 backdrop-blur-xs sm:items-center"
          onClick={() => setShowInspectionTips(false)}
        >
          <div
            className="route-enter w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
              <h2 className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-[#0F172A] sm:text-base">
                Quick Phone Check Guide
              </h2>
              <button
                type="button"
                onClick={() => setShowInspectionTips(false)}
                aria-label="Close guide"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F6F8FB] text-[#0F172A] hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {INSPECTION_VIDEO_CONFIG.checkpoints.map((cp) => (
                <div
                  key={cp.step}
                  className="flex items-start gap-2.5 rounded-xl bg-[#F8FAFC] p-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2095D3]" />
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">{cp.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[#64748B]">
                      {cp.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowInspectionTips(false)}
              className="btn-press mt-4 h-10 w-full cursor-pointer rounded-full bg-[#2095D3] text-xs font-bold text-white hover:bg-[#187BB2]"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          FIXED BOTTOM SCREEN PROGRESSION BARS (All 5 Steps Always Visible)
         =================================================================== */}
      <nav
        aria-label="Phone selling progress"
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#E2E8F0] bg-white/95 px-2.5 pt-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(15,23,42,0.06)] backdrop-blur-md sm:px-8 sm:py-2.5"
      >
        <ol className="mx-auto grid max-w-[1280px] grid-cols-5 gap-1.5 sm:gap-2.5">
          {STEPS.map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            const unlocked = canNavigateToStep(item.step);
            const caption = getStepSummaryCaption(item.step);

            return (
              <li key={item.step} className="min-w-0">
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => unlocked && navigateToStep(item.step)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex w-full min-w-0 flex-col rounded-xl px-1.5 py-1.5 text-left transition-colors sm:px-3 sm:py-2 ${
                    isActive
                      ? 'cursor-pointer bg-[#F0F8FD] ring-1 ring-[#2095D3]/35'
                      : unlocked
                        ? 'cursor-pointer hover:bg-[#F6F8FB]'
                        : 'cursor-not-allowed opacity-65'
                  }`}
                >
                  {/* Individual Step Progression Bar */}
                  <div
                    aria-hidden="true"
                    className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0] sm:h-2"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ease-out ${
                        isCompleted
                          ? 'w-full bg-[#187BB2]'
                          : isActive
                            ? 'w-full bg-[#2095D3]'
                            : 'w-0 bg-transparent'
                      }`}
                    />
                  </div>

                  {/* Step Name + Status */}
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <span
                      className={`truncate text-[10px] leading-none font-bold tracking-[-0.01em] sm:text-xs ${
                        isActive
                          ? 'text-[#090D16]'
                          : isCompleted
                            ? 'text-[#187BB2]'
                            : 'text-[#64748B]'
                      }`}
                    >
                      {item.label}
                    </span>

                    {isCompleted && (
                      <Check className="hidden h-3 w-3 shrink-0 text-[#2095D3] sm:block" />
                    )}
                  </div>

                  {/* Live Selection Micro-Caption */}
                  <span
                    className={`mt-0.5 truncate font-mono text-[9px] leading-tight sm:text-[10.5px] ${
                      isActive
                        ? 'font-semibold text-[#187BB2]'
                        : isCompleted
                          ? 'text-[#475569]'
                          : 'text-[#94A3B8]'
                    }`}
                  >
                    {caption}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </main>
  );
};

export const SellPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  return <SellPageFlow key={searchParams.toString()} searchParams={searchParams} />;
};

export default SellPage;
