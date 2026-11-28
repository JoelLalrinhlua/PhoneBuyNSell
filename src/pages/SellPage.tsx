import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Hash,
  MessageSquareText,
  Minus,
  Pause,
  Play,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  User,
  Video,
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
 * Streamlined 6-Step Phone Selling Journey:
 *  Step 1: Brand
 *  Step 2: Model
 *  Step 3: Storage
 *  Step 4: Condition
 *  Step 5: Inspect (How to Inspect the Phone Video)
 *  Step 6: Evaluation (Final Valuation & Quick Confirmation)
 */
type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS: { step: StepNumber; label: string; title: string }[] = [
  { step: 1, label: 'Brand', title: 'Select Brand' },
  { step: 2, label: 'Model', title: 'Select Model' },
  { step: 3, label: 'Storage', title: 'Select Storage' },
  { step: 4, label: 'Condition', title: 'Select Condition' },
  { step: 5, label: 'Inspect', title: 'Inspection Guide' },
  { step: 6, label: 'Evaluation', title: 'Phone Evaluation' },
];

const DRAFT_STORAGE_KEY = 'arsouq_sell_draft_v3';
const AUTO_ADVANCE_MS = 200;

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
    if (!parsed || typeof parsed.step !== 'number' || parsed.step < 1 || parsed.step > 6) {
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

const staggerStyle = (idx: number): React.CSSProperties =>
  ({ '--stagger': Math.min(idx, 8) }) as React.CSSProperties;

interface InspectionVideoStageProps {
  activeChapterIndex: number;
  onSelectChapter: (idx: number) => void;
}

const InspectionVideoStage: React.FC<InspectionVideoStageProps> = ({
  activeChapterIndex,
  onSelectChapter,
}) => {
  const hasRealVideo = Boolean(INSPECTION_VIDEO_CONFIG.src.trim());
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);
  const [previewProgress, setPreviewProgress] = useState(12);

  useEffect(() => {
    if (hasRealVideo || !isPlayingPreview) return;
    const timer = window.setInterval(() => {
      setPreviewProgress((prev) => {
        const next = prev >= 100 ? 0 : prev + 2;
        const nextIdx = next < 34 ? 0 : next < 68 ? 1 : 2;
        onSelectChapter(nextIdx);
        return next;
      });
    }, 240);
    return () => window.clearInterval(timer);
  }, [hasRealVideo, isPlayingPreview, onSelectChapter]);

  const handleJumpChapter = (idx: number) => {
    onSelectChapter(idx);
    setPreviewProgress(idx === 0 ? 10 : idx === 1 ? 42 : 76);
  };

  const activeCheckpoint =
    INSPECTION_VIDEO_CONFIG.checkpoints[activeChapterIndex] ??
    INSPECTION_VIDEO_CONFIG.checkpoints[0];

  if (hasRealVideo) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#090D16] shadow-[0_12px_30px_rgba(15,23,42,0.1)] sm:rounded-3xl">
        <video
          src={INSPECTION_VIDEO_CONFIG.src}
          poster={INSPECTION_VIDEO_CONFIG.poster}
          controls
          autoPlay
          muted
          playsInline
          className="aspect-video max-h-[220px] w-full bg-[#090D16] object-cover sm:max-h-[320px]"
        >
          Your browser does not support embedded inspection videos.
        </video>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#090D16] text-white shadow-[0_12px_30px_rgba(15,23,42,0.1)] sm:rounded-3xl">
        <div className="relative aspect-video max-h-[210px] w-full overflow-hidden sm:max-h-[310px]">
          <img
            src={INSPECTION_VIDEO_CONFIG.poster}
            alt="Phone inspection video guide"
            width={960}
            height={540}
            className="h-full w-full object-cover opacity-30 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/60 to-[#090D16]/35" />

          {/* Top Bar Badges */}
          <div className="absolute top-2.5 right-3 left-3 flex items-center justify-between gap-2 sm:top-4 sm:right-4 sm:left-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] text-white uppercase backdrop-blur-md">
              <Video className="h-3 w-3 text-[#5CC2F8]" />
              Inspection Video · {INSPECTION_VIDEO_CONFIG.durationLabel}
            </span>
            <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 font-mono text-[10px] text-slate-300 backdrop-blur-md">
              Check {activeCheckpoint.step}/03
            </span>
          </div>

          {/* Center Play / Pause + Live Chapter Title */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <button
              type="button"
              onClick={() => setIsPlayingPreview((p) => !p)}
              aria-label={isPlayingPreview ? 'Pause inspection video' : 'Play inspection video'}
              className="btn-press flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#2095D3] text-white shadow-[0_10px_28px_rgba(32,149,211,0.45)] hover:bg-[#187BB2] sm:h-15 sm:w-15"
            >
              {isPlayingPreview ? (
                <Pause className="h-5 w-5 fill-current sm:h-6 sm:w-6" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current sm:h-6 sm:w-6" />
              )}
            </button>

            <p className="mt-2.5 max-w-md font-['Plus_Jakarta_Sans'] text-sm font-bold text-white sm:mt-3 sm:text-base">
              {activeCheckpoint.title}
            </p>
            <p className="mt-0.5 line-clamp-2 max-w-md text-[11px] leading-snug text-slate-300 sm:text-xs">
              {activeCheckpoint.detail}
            </p>
          </div>

          {/* Bottom Scrubber */}
          <div className="absolute right-0 bottom-0 left-0 px-3.5 pb-2.5 sm:px-4 sm:pb-3.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                style={{ width: `${previewProgress}%` }}
                className="h-full rounded-full bg-[#2095D3] transition-all duration-250 ease-out"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 3-Step Inspection Checkpoints */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {INSPECTION_VIDEO_CONFIG.checkpoints.map((cp, idx) => {
          const isCurrent = activeChapterIndex === idx;
          return (
            <button
              key={cp.step}
              type="button"
              onClick={() => handleJumpChapter(idx)}
              className={`card-lift flex cursor-pointer items-start gap-2.5 rounded-xl border bg-white p-3 text-left sm:flex-col sm:gap-1.5 sm:rounded-2xl sm:p-3.5 ${
                isCurrent
                  ? 'border-[#2095D3] bg-[#F8FCFF] ring-1 ring-[#2095D3]'
                  : 'border-[#E2E8F0] hover:border-[#2095D3]'
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold sm:mt-0 ${
                  isCurrent ? 'bg-[#2095D3] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {cp.step}
              </span>
              <div className="min-w-0">
                <h2 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0F172A] sm:text-[13px]">
                  {cp.title}
                </h2>
                <p className="mt-0.5 text-[11px] leading-snug text-[#64748B]">{cp.detail}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

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
  const [activeVideoChapter, setActiveVideoChapter] = useState<number>(0);

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
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.series.toLowerCase().includes(q) ||
          (m.specBadge?.toLowerCase().includes(q) ?? false)
      );
      pool =
        brandMatches.length > 0
          ? brandMatches
          : PHONE_MODELS.filter(
              (m) =>
                m.name.toLowerCase().includes(q) ||
                m.series.toLowerCase().includes(q) ||
                (m.specBadge?.toLowerCase().includes(q) ?? false)
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
      return target === 5 || target === 6 || (target === 2 && selectedBrandId !== 'other');
    }
    if (target === 2) return Boolean(selectedBrandId);
    if (target === 3) return Boolean(selectedBrandId && selectedModelId);
    if (target === 4) return Boolean(selectedBrandId && selectedModelId && selectedStorage);
    if (target === 5 || target === 6) {
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
    setActiveVideoChapter(0);
    // After selecting condition -> go directly to Step 5 (Inspection Video)
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

  const selectedStorageBasePrice = useMemo(() => {
    if (!selectedModel || !selectedStorage) return 0;
    const opt =
      selectedModel.storageOptions.find((s) => s.capacity === selectedStorage) ??
      selectedModel.storageOptions[0];
    return selectedModel.basePriceAed + opt.priceDeltaAed;
  }, [selectedModel, selectedStorage]);

  const showBottomBar = Boolean(selectedBrandId) && currentStep >= 2 && !submittedRecord;
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
  // 6-STEP PHONE SELLING VIEW + MINIMALIST VIEWPORT-STUCK BOTTOM PROGRESS BAR
  // =========================================================================
  return (
    <>
      <main
        id="main-content"
        className={`route-enter min-h-[calc(100svh-3.5rem)] overflow-x-clip bg-[#F6F8FB] sm:min-h-[calc(100svh-4rem)] ${
          showBottomBar ? 'pb-14 sm:pb-16' : 'pb-6 sm:pb-10'
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-3.5 pt-3 sm:px-8 sm:pt-6 lg:px-10">
          {/* =================================================================
              STEP 1: BRAND (Clean View — No Bottom Bar Until Brand Selected)
             ================================================================= */}
          {currentStep === 1 && (
            <section key="step-1" className={slideAnimationClass}>
              <div className="mb-3 flex items-baseline justify-between gap-2 sm:mb-4">
                <div>
                  <h1 className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                    Select brand
                  </h1>
                  <p className="text-xs text-[#64748B]">
                    Choose your smartphone manufacturer to begin.
                  </p>
                </div>
              </div>

              <div
                className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6"
                role="radiogroup"
                aria-label="Smartphone brands"
              >
                {BRANDS.map((brand, idx) => {
                  const isSelected = selectedBrandId === brand.id;
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      style={staggerStyle(idx)}
                      onClick={() => handleSelectBrand(brand.id)}
                      className={`stagger-item card-lift group relative flex h-[68px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 sm:h-23 sm:rounded-2xl sm:p-4 ${
                        isSelected
                          ? 'border-[#2095D3] bg-[#F8FCFF] ring-2 ring-[#2095D3]'
                          : 'border-[#E2E8F0] bg-white hover:border-[#2095D3]'
                      }`}
                    >
                      <span
                        className={`absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full border transition-opacity duration-200 sm:top-2 sm:right-2 sm:h-4.5 sm:w-4.5 ${
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
                            ? 'h-6.5 w-6.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 sm:h-9 sm:w-9'
                            : 'h-4.5 max-w-[80px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 sm:h-6 sm:max-w-[112px]'
                        }
                      />
                      <span className="font-mono text-[9px] font-medium text-[#64748B] sm:text-[10px]">
                        Up to {formatAed(brand.maxPayoutAed)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                style={staggerStyle(8)}
                onClick={handleSelectOtherUnlistedDevice}
                className="stagger-item card-lift mt-2.5 flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-left hover:border-[#2095D3] sm:mt-3.5 sm:rounded-2xl sm:px-5 sm:py-3.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <MessageSquareText className="h-4 w-4 shrink-0 text-[#2095D3]" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#0F172A] sm:text-sm">
                      Other brand — Device not listed
                    </p>
                    <p className="truncate text-[11px] text-[#64748B]">
                      Watch the inspection guide and request an agent quote
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
              STEPS 2..5 WITH COMPACT MOBILE LAYOUT & DESKTOP SUMMARY RAIL
             ================================================================= */}
          {currentStep >= 2 && currentStep <= 5 && (
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
                          className="h-10 w-full rounded-xl border border-[#CBD5E1] bg-white pr-9 pl-9.5 text-base text-[#0F172A] transition-colors duration-200 placeholder:text-slate-400 focus:border-[#2095D3] focus:outline-none sm:h-11 sm:text-sm"
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
                            className={`btn-press shrink-0 cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold ${
                              seriesFilter === 'all'
                                ? 'bg-[#2095D3] text-white'
                                : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2095D3]'
                            }`}
                          >
                            All ({brandModels.length})
                          </button>
                          {availableSeries.map((series) => (
                            <button
                              key={series}
                              type="button"
                              onClick={() => setSeriesFilter(series)}
                              className={`btn-press shrink-0 cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold ${
                                seriesFilter === series
                                  ? 'bg-[#2095D3] text-white'
                                  : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2095D3]'
                              }`}
                            >
                              {series}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Accurate Phone Model Grid */}
                    <div
                      className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3"
                      role="radiogroup"
                      aria-label="Phone models"
                    >
                      {filteredModels.map((model, idx) => {
                        const isSelected = selectedModelId === model.id;
                        const maxVal = getMaxModelPriceAed(model);
                        return (
                          <button
                            key={model.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            style={staggerStyle(idx)}
                            onClick={() => handleSelectModel(model.id)}
                            className={`stagger-item card-lift group relative flex cursor-pointer flex-col justify-between rounded-xl border bg-white p-2.5 text-left sm:rounded-2xl sm:p-3.5 ${
                              isSelected
                                ? 'border-[#2095D3] bg-[#F8FCFF] ring-2 ring-[#2095D3]'
                                : 'border-[#E2E8F0] hover:border-[#2095D3]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 sm:my-1 sm:h-20 sm:justify-center">
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
                              {model.specBadge && (
                                <p className="truncate text-[10px] font-medium text-[#475569]">
                                  {model.specBadge}
                                </p>
                              )}
                              <p className="truncate text-[10px] text-[#64748B]">
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
                      style={staggerStyle(filteredModels.length)}
                      onClick={handleSelectOtherUnlistedDevice}
                      className="stagger-item card-lift mt-2 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-dashed border-[#CBD5E1] bg-white/80 px-3.5 py-2.5 text-left hover:border-[#2095D3] hover:bg-white sm:mt-3"
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
                    </div>

                    {/* Selected Phone Accurate Spec Strip */}
                    <div
                      style={staggerStyle(0)}
                      className="stagger-item mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-2.5 sm:rounded-2xl sm:p-3.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <img
                          src={selectedModel.image}
                          alt={selectedModel.name}
                          width={44}
                          height={44}
                          className="h-11 w-11 shrink-0 rounded-lg bg-[#F8FAFC] object-contain p-1"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0F172A] sm:text-sm">
                            {selectedBrand?.name} {selectedModel.name}
                          </p>
                          <p className="truncate text-[11px] text-[#64748B]">
                            {selectedModel.releaseYear}
                            {selectedModel.specBadge ? ` · ${selectedModel.specBadge}` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigateToStep(2)}
                        className="btn-press shrink-0 cursor-pointer rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-[#187BB2] hover:border-[#2095D3]"
                      >
                        Change
                      </button>
                    </div>

                    {/* Official Color Finish Row */}
                    {selectedModel.colors.length > 0 && (
                      <div
                        style={staggerStyle(1)}
                        className="stagger-item mb-3 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 sm:rounded-2xl sm:p-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#64748B]">
                            Finish
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
                                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]'
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
                      {selectedModel.storageOptions.map((opt, idx) => {
                        const isSelected = selectedStorage === opt.capacity;
                        const tierMaxPrice = selectedModel.basePriceAed + opt.priceDeltaAed;
                        return (
                          <button
                            key={opt.capacity}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            style={staggerStyle(idx + 2)}
                            onClick={() => handleSelectStorage(opt.capacity)}
                            className={`stagger-item card-lift flex min-h-[74px] cursor-pointer items-center justify-between rounded-xl border bg-white p-3.5 text-left sm:min-h-[86px] sm:rounded-2xl sm:p-5 ${
                              isSelected
                                ? 'border-[#2095D3] bg-[#F8FCFF] ring-2 ring-[#2095D3]'
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
                              className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 sm:h-6 sm:w-6 ${
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
                    STEP 4: REFINED CONDITION PAGE
                   ============================================================= */}
                {currentStep === 4 && selectedModel && selectedStorage && (
                  <section key="step-4" className={slideAnimationClass}>
                    {/* Header + Selected Phone Context */}
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
                          <p className="truncate text-[11px] text-[#64748B]">
                            {selectedModel.name} · {selectedStorage}
                            {selectedColor ? ` · ${selectedColor}` : ''}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 font-mono text-[10.5px] font-semibold text-[#0F172A] tabular-nums">
                        Max {formatAed(selectedStorageBasePrice)}
                      </span>
                    </div>

                    {/* Refined Condition Tiers — Full Untruncated Criteria + Scannable Badges */}
                    <div
                      className="space-y-1.5 sm:space-y-2"
                      role="radiogroup"
                      aria-label="Phone condition"
                    >
                      {CONDITION_TIERS.map((tier, idx) => {
                        const isSelected = selectedCondition === tier.id;
                        const isFlawless = tier.id === 'zero-scratch';
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
                            style={staggerStyle(idx)}
                            onClick={() => handleSelectCondition(tier.id)}
                            className={`stagger-item card-lift group flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl border bg-white px-3 py-2 text-left sm:rounded-2xl sm:px-4.5 sm:py-3.5 ${
                              isSelected
                                ? 'border-[#2095D3] bg-[#F8FCFF] ring-2 ring-[#2095D3]'
                                : 'border-[#E2E8F0] hover:border-[#2095D3]'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  style={{ backgroundColor: tier.indicatorHex }}
                                  className="h-2 w-2 shrink-0 rounded-full"
                                />
                                <h2 className="truncate font-['Plus_Jakarta_Sans'] text-[13px] font-bold text-[#0F172A] sm:text-sm">
                                  {tier.title}
                                </h2>
                                {tier.badgeLabel && (
                                  <span
                                    className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold sm:px-2 sm:text-[9.5px] ${
                                      isFlawless
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-[#F1F5F9] text-[#475569]'
                                    }`}
                                  >
                                    {tier.badgeLabel}
                                  </span>
                                )}
                              </div>

                              <p className="mt-0.5 text-[11px] leading-snug text-[#64748B] sm:text-xs">
                                {tier.summary}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 text-right">
                              <div>
                                <span className="block font-mono text-xs font-extrabold text-[#187BB2] tabular-nums sm:text-sm">
                                  {tier.deductionAed === null
                                    ? 'Agent quote'
                                    : formatAed(previewVal.unitEstimateAed)}
                                </span>
                                <span
                                  className={`block font-mono text-[10px] font-semibold ${
                                    isFlawless ? 'text-emerald-600' : 'text-[#64748B]'
                                  }`}
                                >
                                  {tier.deductionAed === null
                                    ? 'Custom offer'
                                    : tier.deductionAed === 0
                                      ? 'No deduction'
                                      : `-AED ${tier.deductionAed.toLocaleString('en-US')}`}
                                </span>
                              </div>

                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                                  isSelected
                                    ? 'check-pop border-[#2095D3] bg-[#2095D3] text-white'
                                    : 'border-[#CBD5E1] bg-white group-hover:border-[#2095D3]'
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 text-[#64748B] group-hover:text-[#2095D3]" />
                                )}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* =============================================================
                    STEP 5: HOW TO INSPECT THE PHONE VIDEO (Right After Condition)
                   ============================================================= */}
                {currentStep === 5 && (
                  <section key="step-5" className={`${slideAnimationClass} space-y-3`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={handleStepBack}
                          aria-label="Previous step"
                          className="btn-press flex h-8.5 w-8.5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#2095D3]"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="min-w-0">
                          <h1 className="truncate font-['Plus_Jakarta_Sans'] text-base font-extrabold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
                            {INSPECTION_VIDEO_CONFIG.title}
                          </h1>
                          <p className="truncate text-[11px] text-[#64748B]">
                            Selected:{' '}
                            <strong className="font-semibold text-[#0F172A]">
                              {liveValuation?.appliedTierTitle ?? 'Condition'}
                            </strong>
                          </p>
                        </div>
                      </div>

                      {!isCustomUnlistedDevice && (
                        <button
                          type="button"
                          onClick={() => navigateToStep(4)}
                          className="btn-press shrink-0 cursor-pointer rounded-full border border-[#CBD5E1] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#187BB2] hover:border-[#2095D3]"
                        >
                          Edit Condition
                        </button>
                      )}
                    </div>

                    {/* Interactive Inspection Video + 3 Checkpoints */}
                    <InspectionVideoStage
                      activeChapterIndex={activeVideoChapter}
                      onSelectChapter={setActiveVideoChapter}
                    />

                    {/* Primary Continue CTA to Evaluation */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => navigateToStep(6)}
                        className="btn-press flex h-11.5 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#2095D3] px-6 text-xs font-bold tracking-[0.04em] text-white uppercase shadow-[0_8px_20px_rgba(32,149,211,0.26)] hover:bg-[#187BB2] sm:h-12 sm:text-sm"
                      >
                        <span>
                          {liveValuation && !liveValuation.isAgentQuote
                            ? `Continue to Evaluation · ${formatAed(liveValuation.finalEstimateAed)}`
                            : 'Continue to Evaluation'}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </section>
                )}
              </div>

              {/* DESKTOP STICKY SUMMARY RAIL (Steps 2–5) */}
              <aside className="hidden lg:sticky lg:top-22 lg:col-span-4 lg:block">
                <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
                    <span className="font-mono text-[11px] font-semibold text-[#64748B] uppercase">
                      Live Selection
                    </span>
                    <span className="font-mono text-[11px] font-medium text-[#64748B]">
                      0{currentStep} / 06
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
                        className="step-slide-forward h-full w-full object-contain"
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
                        {selectedModel ? selectedModel.name : isCustomUnlistedDevice ? 'Unlisted' : '—'}
                      </dd>
                    </div>
                    {!isCustomUnlistedDevice && (
                      <>
                        <div className="flex items-center justify-between py-2">
                          <dt className="text-[#64748B]">Storage</dt>
                          <dd className="font-mono font-semibold text-[#0F172A]">
                            {selectedStorage ?? '—'}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <dt className="text-[#64748B]">Finish</dt>
                          <dd className="max-w-[165px] truncate font-semibold text-[#0F172A]">
                            {selectedColor || '—'}
                          </dd>
                        </div>
                      </>
                    )}
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
              STEP 6: EVALUATION (Final Valuation Breakdown + Quick Sell Confirm)
             ================================================================= */}
          {currentStep === 6 && liveValuation && (
            <section key="step-6" className={slideAnimationClass}>
              <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-4">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStepBack}
                    aria-label="Back to Inspection Video"
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
                {/* Left Column on Desktop / Top Card on Phone: Evaluated Price & Accurate Specs */}
                <div className="min-w-0 space-y-2.5 lg:col-span-5">
                  <div
                    style={staggerStyle(0)}
                    className="stagger-item overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:rounded-3xl"
                  >
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
                              ? `${selectedBrand?.name ?? ''} ${selectedModel.name} · ${selectedStorage}${
                                  selectedColor ? ` · ${selectedColor}` : ''
                                }`
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

                    {/* Itemized Valuation Breakdown */}
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

                  {/* Compact Linked User Account Bar */}
                  <Link
                    to="/dashboard"
                    style={staggerStyle(1)}
                    className="stagger-item card-lift flex items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs hover:border-[#2095D3]"
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
                    <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-[#187BB2]">
                      <span>My Info</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </div>

                {/* Right Column on Desktop / Compact Confirmation Card on Phone */}
                <form
                  onSubmit={validateAndSubmit}
                  noValidate
                  style={staggerStyle(2)}
                  className="stagger-item min-w-0 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.03)] sm:rounded-3xl sm:p-5 lg:col-span-7"
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
                          className="mt-1 h-10 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-base text-[#0F172A] transition-colors duration-200 focus:border-[#2095D3] focus:outline-none sm:text-sm"
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
                            className="btn-press flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-lg text-[#0F172A] hover:bg-[#F6F8FB]"
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
                            className="btn-press flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-lg text-[#0F172A] hover:bg-[#F6F8FB]"
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
                          className="h-10 w-full rounded-xl border border-[#CBD5E1] bg-white pr-3.5 pl-8.5 font-mono text-base text-[#0F172A] transition-colors duration-200 placeholder:font-sans placeholder:text-xs placeholder:text-slate-400 focus:border-[#2095D3] focus:outline-none sm:text-xs"
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
                              className={`btn-press cursor-pointer rounded-xl border px-2 py-2 text-center ${
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

                    {/* Smooth Expandable Notes */}
                    {liveValuation.isAgentQuote || showOptionalNotes ? (
                      <div className="step-slide-forward">
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
                          className="mt-1 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-base text-[#0F172A] transition-colors duration-200 focus:border-[#2095D3] focus:outline-none sm:text-xs"
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
                        className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-[#64748B] transition-colors duration-200 hover:text-[#2095D3]"
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
      </main>

      {/* ===================================================================
          MINIMALIST VIEWPORT-STUCK BOTTOM PROGRESS BAR (Shown After Brand)
         =================================================================== */}
      {showBottomBar && (
        <nav
          aria-label="Phone selling progress"
          className="bottom-dock-enter fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/92 px-2.5 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-lg sm:px-4"
        >
          <ol className="mx-auto grid max-w-3xl grid-cols-6 gap-1 sm:gap-2">
            {STEPS.map((item) => {
              const isActive = currentStep === item.step;
              const isCompleted = currentStep > item.step;
              const unlocked = canNavigateToStep(item.step);

              return (
                <li key={item.step} className="min-w-0">
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => unlocked && navigateToStep(item.step)}
                    aria-current={isActive ? 'step' : undefined}
                    className={`group flex w-full min-w-0 flex-col items-center py-0.5 text-center transition-opacity duration-200 ${
                      unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-55'
                    }`}
                  >
                    {/* Minimalist Slim Progress Bar */}
                    <div
                      aria-hidden="true"
                      className="h-[3px] w-full overflow-hidden rounded-full bg-slate-200/90"
                    >
                      <div
                        className={`h-full w-full origin-left rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isCompleted
                            ? 'scale-x-100 bg-[#2095D3]/65'
                            : isActive
                              ? 'scale-x-100 bg-[#2095D3]'
                              : 'scale-x-0 bg-[#2095D3]'
                        }`}
                      />
                    </div>

                    {/* Clean Minimalist Label */}
                    <span
                      className={`mt-1 truncate text-[9.5px] leading-none tracking-[-0.015em] transition-colors duration-300 sm:text-[11px] ${
                        isActive
                          ? 'font-bold text-[#2095D3]'
                          : isCompleted
                            ? 'font-medium text-[#0F172A] group-hover:text-[#2095D3]'
                            : 'font-medium text-[#94A3B8]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </>
  );
};

export const SellPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  return <SellPageFlow key={searchParams.toString()} searchParams={searchParams} />;
};

export default SellPage;
