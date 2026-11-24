import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
  X,
  BatteryCharging,
  Smartphone,
  Cpu,
  PackageCheck,
  CalendarClock,
  MapPin,
  Printer,
  RotateCcw,
  Layers,
  AlertCircle,
} from 'lucide-react';
import {
  ACCESSORY_BONUSES,
  BRANDS,
  CONDITION_TIERS,
  KNOWN_ISSUES_CATALOG,
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
  AccessoryBonusId,
  BatteryHealthTier,
  BodyStatus,
  BrandId,
  ConditionId,
  DeviceEvaluation,
  FunctionalStatus,
  KnownIssueId,
  PayoutMethod,
  PickupSlot,
  ScreenStatus,
  SellSubmissionRecord,
  StorageCapacity,
  UAEEmirate,
} from '../types/buyback';

type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type EvalSubStep = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS: { step: StepNumber; short: string; title: string }[] = [
  { step: 1, short: 'Brand', title: 'Select Brand' },
  { step: 2, short: 'Model', title: 'Select Model' },
  { step: 3, short: 'Storage', title: 'Select Storage' },
  { step: 4, short: 'Condition', title: 'Device Condition' },
  { step: 5, short: 'Evaluation', title: 'Device Evaluation' },
  { step: 6, short: 'Estimate', title: 'Price Estimation' },
  { step: 7, short: 'Submit', title: 'Selling Details' },
];

const EVAL_SUBSTEPS: { sub: EvalSubStep; short: string; label: string }[] = [
  { sub: 1, short: 'Battery', label: 'Maximum Battery Health' },
  { sub: 2, short: 'Screen', label: 'Screen & Display Glass' },
  { sub: 3, short: 'Enclosure', label: 'Frame & Rear Glass' },
  { sub: 4, short: 'Function', label: 'Core Functionality' },
  { sub: 5, short: 'Issues', label: 'Known Issues Check' },
  { sub: 6, short: 'Extras', label: 'Included Box & Warranty' },
];

const INITIAL_EVALUATION: DeviceEvaluation = {
  batteryHealth: '90-100',
  screenStatus: 'pristine',
  bodyStatus: 'spotless',
  functionalStatus: 'fully-working',
  knownIssues: [],
  accessories: [],
};

const AUTO_ADVANCE_MS = 210;

export const SellPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const advanceTimerRef = useRef<number | null>(null);

  // Read optional deep-link params (?brand=apple&model=iphone-16-pro-max)
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

  const [selectedBrandId, setSelectedBrandId] = useState<BrandId | null>(initialSetup.brandId);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(initialSetup.modelId);
  const [selectedStorage, setSelectedStorage] = useState<StorageCapacity | null>(
    initialSetup.storage
  );
  const [selectedColor, setSelectedColor] = useState<string>(initialSetup.colorName);
  const [selectedCondition, setSelectedCondition] = useState<ConditionId | null>(null);
  const [evaluation, setEvaluation] = useState<DeviceEvaluation>(INITIAL_EVALUATION);

  // Step 2 Search & Series Filter
  const [modelQuery, setModelQuery] = useState('');
  const [seriesFilter, setSeriesFilter] = useState<string>('all');

  // Step 7 Seller Contact & Pickup Form State (preserved if user navigates backward)
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

  // Cleanup any pending auto-advance timeout on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const scheduleAutoAdvance = (fn: () => void) => {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
    }
    advanceTimerRef.current = window.setTimeout(() => {
      setTransitionDir('forward');
      fn();
    }, AUTO_ADVANCE_MS);
  };

  const navigateToStep = (target: StepNumber, targetSubStep?: EvalSubStep) => {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
    }
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

  // Sync smoothly if query params change via header/footer links
  useEffect(() => {
    setCurrentStep(initialSetup.step);
    setEvalSubStep(1);
    setSelectedBrandId(initialSetup.brandId);
    setSelectedModelId(initialSetup.modelId);
    setSelectedStorage(initialSetup.storage);
    setSelectedColor(initialSetup.colorName);
    setSubmittedRecord(null);
  }, [initialSetup]);

  // Smooth scroll to top when major step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const selectedBrand = useMemo(
    () => BRANDS.find((b) => b.id === selectedBrandId) ?? null,
    [selectedBrandId]
  );

  const selectedModel = useMemo(
    () => PHONE_MODELS.find((m) => m.id === selectedModelId) ?? null,
    [selectedModelId]
  );

  const brandModels = useMemo(() => {
    if (!selectedBrandId) return PHONE_MODELS;
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

  const activeConditionForCalc: ConditionId = selectedCondition ?? 'flawless';

  // Live Valuation Calculation
  const liveValuation = useMemo(() => {
    if (!selectedModel) return null;
    const activeStorage = selectedStorage ?? selectedModel.storageOptions[0].capacity;
    return calculateValuation(
      selectedModel,
      activeStorage,
      activeConditionForCalc,
      evaluation
    );
  }, [selectedModel, selectedStorage, activeConditionForCalc, evaluation]);

  // Continuous overall progress percentage across Steps 1..7 (including Step 5 substeps)
  const progressPercent = useMemo(() => {
    if (currentStep < 5) {
      return ((currentStep - 1) / 6.5) * 100 + 8;
    }
    if (currentStep === 5) {
      const base = (4 / 6.5) * 100;
      const span = (1 / 6.5) * 100;
      return base + ((evalSubStep - 1) / 6) * span + 4;
    }
    if (currentStep === 6) return 88;
    return 100;
  }, [currentStep, evalSubStep]);

  const canNavigateToStep = (target: StepNumber): boolean => {
    if (submittedRecord) return false;
    if (target === 1) return true;
    if (target === 2) return Boolean(selectedBrandId);
    if (target === 3) return Boolean(selectedBrandId && selectedModelId);
    if (target === 4) return Boolean(selectedBrandId && selectedModelId && selectedStorage);
    if (target >= 5)
      return Boolean(
        selectedBrandId && selectedModelId && selectedStorage && selectedCondition
      );
    return false;
  };

  // =========================================================================
  // AUTO-ADVANCING SELECTION HANDLERS (Click -> Highlight -> Next Step)
  // =========================================================================

  // Step 1 -> Step 2
  const handleSelectBrand = (brandId: BrandId) => {
    if (brandId !== selectedBrandId) {
      setSelectedBrandId(brandId);
      setSelectedModelId(null);
      setSelectedStorage(null);
      setSelectedColor('');
      setSeriesFilter('all');
      setModelQuery('');
    }
    scheduleAutoAdvance(() => {
      setCurrentStep(2);
    });
  };

  // Step 2 -> Step 3
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

    scheduleAutoAdvance(() => {
      setCurrentStep(3);
    });
  };

  // Step 3 -> Step 4
  const handleSelectStorage = (capacity: StorageCapacity) => {
    setSelectedStorage(capacity);
    scheduleAutoAdvance(() => {
      setCurrentStep(4);
    });
  };

  // Step 4 -> Step 5 (Sub-step 1)
  const handleSelectCondition = (condId: ConditionId) => {
    setSelectedCondition(condId);
    setEvaluation((prev) => {
      if (condId === 'flawless') {
        return { ...prev, screenStatus: 'pristine', bodyStatus: 'spotless' };
      }
      if (condId === 'good') {
        return {
          ...prev,
          screenStatus: prev.screenStatus === 'cracked' ? 'micro-scratches' : prev.screenStatus,
          bodyStatus: prev.bodyStatus === 'dents-cracks' ? 'light-scuffs' : prev.bodyStatus,
        };
      }
      if (condId === 'damaged') {
        return { ...prev, screenStatus: 'cracked' };
      }
      return prev;
    });
    scheduleAutoAdvance(() => {
      setEvalSubStep(1);
      setCurrentStep(5);
    });
  };

  // Step 5.1 (Battery) -> Step 5.2 (Screen)
  const handleSelectBattery = (tier: BatteryHealthTier) => {
    setEvaluation((p) => ({ ...p, batteryHealth: tier }));
    scheduleAutoAdvance(() => {
      setEvalSubStep(2);
    });
  };

  // Step 5.2 (Screen) -> Step 5.3 (Enclosure)
  const handleSelectScreen = (status: ScreenStatus) => {
    setEvaluation((p) => ({ ...p, screenStatus: status }));
    scheduleAutoAdvance(() => {
      setEvalSubStep(3);
    });
  };

  // Step 5.3 (Enclosure) -> Step 5.4 (Functionality)
  const handleSelectBody = (status: BodyStatus) => {
    setEvaluation((p) => ({ ...p, bodyStatus: status }));
    scheduleAutoAdvance(() => {
      setEvalSubStep(4);
    });
  };

  // Step 5.4 (Functionality) -> Step 5.5 (Known Issues)
  const handleSelectFunctionality = (status: FunctionalStatus) => {
    setEvaluation((p) => ({ ...p, functionalStatus: status }));
    scheduleAutoAdvance(() => {
      setEvalSubStep(5);
    });
  };

  // Step 5.5 ("No Known Issues") -> Step 5.6 (Extras)
  const handleNoKnownIssues = () => {
    setEvaluation((p) => ({ ...p, knownIssues: [] }));
    scheduleAutoAdvance(() => {
      setEvalSubStep(6);
    });
  };

  const toggleKnownIssue = (issueId: KnownIssueId) => {
    setEvaluation((prev) => {
      const exists = prev.knownIssues.includes(issueId);
      const nextIssues = exists
        ? prev.knownIssues.filter((i) => i !== issueId)
        : [...prev.knownIssues, issueId];
      return { ...prev, knownIssues: nextIssues };
    });
  };

  // Step 5.6 ("Device Only — No Extras") -> Step 6 (Price Estimation)
  const handleNoExtrasFinish = () => {
    setEvaluation((p) => ({ ...p, accessories: [] }));
    scheduleAutoAdvance(() => {
      setCurrentStep(6);
    });
  };

  const toggleAccessory = (accId: AccessoryBonusId) => {
    setEvaluation((prev) => {
      const exists = prev.accessories.includes(accId);
      const nextAcc = exists
        ? prev.accessories.filter((a) => a !== accId)
        : [...prev.accessories, accId];
      return { ...prev, accessories: nextAcc };
    });
  };

  const handleStepBack = () => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    setTransitionDir('backward');
    if (currentStep === 5 && evalSubStep > 1) {
      setEvalSubStep((s) => (s - 1) as EvalSubStep);
      return;
    }
    if (currentStep === 6) {
      setCurrentStep(5);
      setEvalSubStep(6);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepNumber);
    }
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand || !selectedModel || !selectedStorage || !liveValuation) return;

    const errors: Record<string, string> = {};
    if (fullName.trim().length < 2) {
      errors.fullName = 'Enter your full name as it appears on your UAE ID or bank account.';
    }
    const digitsOnly = phoneUae.replace(/\D/g, '');
    if (digitsOnly.length < 9) {
      errors.phoneUae = 'Enter a valid UAE mobile number (e.g. 050 123 4567).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address to receive your valuation confirmation.';
    }
    if (areaAndStreet.trim().length < 3) {
      errors.areaAndStreet = 'Enter your community and street name for courier pickup.';
    }
    if (buildingOrVilla.trim().length < 2) {
      errors.buildingOrVilla = 'Enter your building name or villa number.';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const conditionObj =
      CONDITION_TIERS.find((c) => c.id === activeConditionForCalc) ?? CONDITION_TIERS[0];

    const saved = saveSellSubmission({
      brandId: selectedBrand.id,
      brandName: selectedBrand.name,
      modelId: selectedModel.id,
      modelName: selectedModel.name,
      storage: selectedStorage,
      colorName: selectedColor,
      conditionId: activeConditionForCalc,
      conditionTitle: conditionObj.title,
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
        ? 'Instant UAE Bank Transfer (IBAN)'
        : submittedRecord.seller.payoutMethod === 'instant-cash'
          ? 'Instant Cash at Handover'
          : 'Digital Wallet Payout';

    return (
      <main id="main-content" className="min-h-[82vh] bg-[#F8F8F7] py-12 lg:py-20">
        <div className="step-slide-forward mx-auto max-w-4xl px-5 sm:px-8">
          <div className="overflow-hidden rounded-3xl border border-[#E4E4E0] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <div className="bg-[#0A0A0C] p-8 text-white sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#059669]/20 px-3.5 py-1.5 font-mono text-xs font-semibold text-[#34D399]">
                  <CheckCircle2 className="h-4 w-4" />
                  Sell Request Confirmed
                </span>
                <span className="font-mono text-xs text-[#A1A1AA]">
                  Ref: <strong className="text-white">{submittedRecord.referenceCode}</strong>
                </span>
              </div>

              <div className="mt-8 grid grid-cols-1 items-end gap-6 sm:grid-cols-12">
                <div className="sm:col-span-7">
                  <p className="text-xs tracking-[0.12em] text-[#A1A1AA] uppercase">
                    7-Day Locked Buyback Offer
                  </p>
                  <p className="mt-2 font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-[-0.03em] text-white tabular-nums sm:text-5xl">
                    {formatAed(submittedRecord.valuation.finalEstimateAed)}
                  </p>
                  <p className="mt-2 text-sm text-[#D4D4D8]">
                    {submittedRecord.brandName} {submittedRecord.modelName} ·{' '}
                    {submittedRecord.storage} · {submittedRecord.colorName}
                  </p>
                </div>

                <div className="sm:col-span-5 sm:text-right">
                  <p className="text-xs text-[#A1A1AA]">Condition Grade</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {submittedRecord.conditionTitle}
                  </p>
                  <p className="mt-3 text-xs text-[#A1A1AA]">Settlement Method</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{payoutLabel}</p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <div className="grid grid-cols-1 gap-8 border-b border-[#ECECE8] pb-8 sm:grid-cols-2">
                <div>
                  <h2 className="font-mono text-xs font-semibold tracking-[0.12em] text-[#71717A] uppercase">
                    UAE Collection Details
                  </h2>
                  <p className="mt-3 font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                    {submittedRecord.seller.fullName}
                  </p>
                  <p className="mt-1 text-sm text-[#52525B]">
                    {submittedRecord.seller.buildingOrVilla}, {submittedRecord.seller.areaAndStreet}
                  </p>
                  <p className="text-sm font-medium text-[#0A0A0C]">
                    {submittedRecord.seller.emirate}, United Arab Emirates
                  </p>
                  <p className="mt-2 font-mono text-xs text-[#52525B]">
                    {submittedRecord.seller.phoneUae} · {submittedRecord.seller.email}
                  </p>
                </div>

                <div>
                  <h2 className="font-mono text-xs font-semibold tracking-[0.12em] text-[#71717A] uppercase">
                    Scheduled Pickup Window
                  </h2>
                  <p className="mt-3 font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                    {slotLabel}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#52525B]">
                    Our UAE specialist will message you 30 minutes prior to arrival, complete a 3-minute verification, and release your{' '}
                    {formatAed(submittedRecord.valuation.finalEstimateAed)} payment on the spot.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-mono text-xs font-semibold tracking-[0.12em] text-[#71717A] uppercase">
                  Before Courier Arrival
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#ECECE8] bg-[#FAFAF9] p-4">
                    <p className="text-xs font-bold text-[#0A0A0C]">01. Back up your data</p>
                    <p className="mt-1 text-xs text-[#52525B]">
                      Sync photos and contacts to iCloud or Google Drive.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#ECECE8] bg-[#FAFAF9] p-4">
                    <p className="text-xs font-bold text-[#0A0A0C]">02. Sign out of accounts</p>
                    <p className="mt-1 text-xs text-[#52525B]">
                      Disable Find My / FRP lock and remove your SIM or eSIM.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#ECECE8] bg-[#FAFAF9] p-4">
                    <p className="text-xs font-bold text-[#0A0A0C]">03. Keep Emirates ID ready</p>
                    <p className="mt-1 text-xs text-[#52525B]">
                      Required under UAE second-hand electronics regulations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-[#ECECE8] pt-7">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-press inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D4D4D0] bg-white px-5 py-2.5 text-xs font-semibold text-[#0A0A0C] hover:border-[#0A0A0C]"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print Summary
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAnotherPhone}
                    className="btn-press inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D4D4D0] bg-white px-5 py-2.5 text-xs font-semibold text-[#0A0A0C] hover:border-[#0A0A0C]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Value Another Phone
                  </button>
                </div>

                <Link
                  to="/"
                  className="btn-press btn-sheen inline-flex items-center gap-2 rounded-full bg-[#0A0A0C] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#232326]"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================================
  // INTERACTIVE STEP-BY-STEP CONFIGURATOR STUDIO
  // =========================================================================
  return (
    <main id="main-content" className="route-enter min-h-screen bg-[#F8F8F7] pb-24">
      {/* Top Progress Bar & Step Tracker */}
      <div className="relative border-b border-[#E5E5E0] bg-white">
        <div className="mx-auto max-w-[1360px] px-5 py-4 sm:px-8 lg:px-12">
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
                      className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                        isActive
                          ? 'cursor-pointer border-[#0A0A0C] bg-[#0A0A0C] text-white shadow-sm'
                          : isCompleted
                            ? 'cursor-pointer border-[#E2E2DE] bg-[#FAFAF9] text-[#0A0A0C] hover:border-[#0A0A0C]'
                            : unlocked
                              ? 'cursor-pointer border-transparent bg-transparent text-[#52525B] hover:bg-[#F4F4F2]'
                              : 'cursor-not-allowed border-transparent bg-transparent text-[#A1A1AA]'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold transition-colors ${
                          isActive
                            ? 'bg-white text-[#0A0A0C]'
                            : isCompleted
                              ? 'bg-[#0A0A0C] text-white'
                              : 'bg-[#ECECE8] text-[#71717A]'
                        }`}
                      >
                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : `0${item.step}`}
                      </span>
                      <span className="truncate text-xs font-semibold">{item.short}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Tablet & Mobile Compact Progress Header */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {(currentStep > 1 || (currentStep === 5 && evalSubStep > 1)) && (
                  <button
                    type="button"
                    onClick={handleStepBack}
                    aria-label="Go to previous step"
                    className="btn-press flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DFDFDB] bg-white text-[#0A0A0C]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <div>
                  <p className="font-mono text-[11px] font-semibold text-[#71717A]">
                    STEP 0{currentStep} OF 07
                    {currentStep === 5 ? ` · PART ${evalSubStep}/6` : ''}
                  </p>
                  <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0A0A0C]">
                    {currentStep === 5
                      ? EVAL_SUBSTEPS[evalSubStep - 1].label
                      : STEPS[currentStep - 1].title}
                  </p>
                </div>
              </div>

              {liveValuation && currentStep >= 3 && (
                <div className="text-right">
                  <p className="text-[10px] font-medium text-[#71717A] uppercase">Estimate</p>
                  <AnimatedAed
                    amount={liveValuation.finalEstimateAed}
                    className="font-mono text-sm font-bold text-[#0A0A0C]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Continuous Smooth Progress Line */}
        <div className="h-[2px] w-full bg-[#EFEFEC]" aria-hidden="true">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-[#0A0A0C] transition-all duration-500 ease-out"
          />
        </div>
      </div>

      {/* Main Two-Column Configurator Workspace */}
      <div className="mx-auto max-w-[1360px] px-5 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* =================================================================
              LEFT / PRIMARY STAGE (8 COLS)
             ================================================================= */}
          <div className="lg:col-span-8">
            {/* Inline Back Button Above Step Heading */}
            {(currentStep > 1 || (currentStep === 5 && evalSubStep > 1)) && (
              <div className="mb-4 hidden sm:block">
                <button
                  type="button"
                  onClick={handleStepBack}
                  className="group inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#52525B] transition-colors hover:text-[#0A0A0C]"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span>
                    {currentStep === 5 && evalSubStep > 1
                      ? `Back to ${EVAL_SUBSTEPS[evalSubStep - 2].short}`
                      : `Back to ${STEPS[currentStep - 2].short}`}
                  </span>
                </button>
              </div>
            )}

            {/* ---------------------------------------------------------------
                STEP 1: BRAND SELECTION (Clean — no "Up to AED" amounts, auto-advances on click)
               --------------------------------------------------------------- */}
            {currentStep === 1 && (
              <section key="step-1" className={slideAnimationClass}>
                <div className="mb-7">
                  <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                    Step 01 · Manufacturer
                  </p>
                  <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                    Select your smartphone brand.
                  </h1>
                  <p className="mt-2 text-sm text-[#52525B]">
                    Tap your phone manufacturer to jump directly to model selection.
                  </p>
                </div>

                <div
                  className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4"
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
                        className={`card-lift group relative flex h-34 cursor-pointer flex-col items-center justify-between rounded-2xl border p-4 text-center ${
                          isSelected
                            ? 'border-[#0A0A0C] bg-white ring-2 ring-[#0A0A0C]'
                            : 'border-[#E5E5E1] bg-white hover:border-[#0A0A0C]'
                        }`}
                      >
                        <div className="flex w-full items-center justify-end">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                              isSelected
                                ? 'check-pop border-[#0A0A0C] bg-[#0A0A0C] text-white'
                                : 'border-[#D4D4D0] bg-white group-hover:border-[#0A0A0C]'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </span>
                        </div>

                        <div className="my-auto flex h-12 items-center justify-center px-2 transition-transform duration-300 group-hover:scale-105">
                          <BrandLogo
                            brandId={brand.id}
                            className={
                              brand.id === 'google' || brand.id === 'xiaomi'
                                ? 'h-11 w-11'
                                : 'h-7 max-w-[125px]'
                            }
                          />
                        </div>

                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium text-[#8E8E93] transition-colors group-hover:text-[#0A0A0C]">
                          <span>{brand.deviceCount} models</span>
                          <ArrowRight className="h-2.5 w-2.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ---------------------------------------------------------------
                STEP 2: MODEL SELECTION (Auto-advances on click)
               --------------------------------------------------------------- */}
            {currentStep === 2 && (
              <section key="step-2" className={slideAnimationClass}>
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                      Step 02 · {selectedBrand ? selectedBrand.name : 'Device'} Lineup
                    </p>
                    <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                      Select your model.
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToStep(1)}
                    className="btn-press inline-flex cursor-pointer items-center gap-1.5 self-start rounded-full border border-[#DFDFDB] bg-white px-3.5 py-1.5 text-xs font-medium text-[#0A0A0C] hover:border-[#0A0A0C] sm:self-auto"
                  >
                    <span>Change Brand ({selectedBrand?.name})</span>
                  </button>
                </div>

                {/* Search Input + Series Filter Pills */}
                <div className="mb-6 space-y-3">
                  <div className="relative">
                    <label htmlFor="model-search" className="sr-only">
                      Search phone models
                    </label>
                    <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
                    <input
                      id="model-search"
                      type="text"
                      value={modelQuery}
                      onChange={(e) => setModelQuery(e.target.value)}
                      placeholder={`Search ${selectedBrand?.name ?? ''} models (e.g. Pro Max, Ultra, Fold)...`}
                      className="h-12 w-full rounded-2xl border border-[#DFDFDB] bg-white pr-10 pl-11 text-sm text-[#0A0A0C] transition-colors placeholder:text-[#8E8E93] focus:border-[#0A0A0C] focus:outline-none"
                    />
                    {modelQuery && (
                      <button
                        type="button"
                        onClick={() => setModelQuery('')}
                        aria-label="Clear search"
                        className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#71717A] hover:bg-[#F4F4F2] hover:text-[#0A0A0C]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {!modelQuery && availableSeries.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSeriesFilter('all')}
                        className={`btn-press cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                          seriesFilter === 'all'
                            ? 'bg-[#0A0A0C] text-white'
                            : 'border border-[#E4E4E0] bg-white text-[#52525B] hover:border-[#0A0A0C]'
                        }`}
                      >
                        All Series ({brandModels.length})
                      </button>
                      {availableSeries.map((series) => (
                        <button
                          key={series}
                          type="button"
                          onClick={() => setSeriesFilter(series)}
                          className={`btn-press cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                            seriesFilter === series
                              ? 'bg-[#0A0A0C] text-white'
                              : 'border border-[#E4E4E0] bg-white text-[#52525B] hover:border-[#0A0A0C]'
                          }`}
                        >
                          {series}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {filteredModels.length === 0 ? (
                  <div className="rounded-2xl border border-[#E5E5E1] bg-white p-10 text-center">
                    <p className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0A0A0C]">
                      No matching smartphone models found
                    </p>
                    <p className="mt-1 text-sm text-[#52525B]">
                      Clear your search filter or switch brands to browse all supported models.
                    </p>
                    <button
                      type="button"
                      onClick={() => setModelQuery('')}
                      className="btn-press mt-4 cursor-pointer rounded-full bg-[#0A0A0C] px-5 py-2 text-xs font-semibold text-white"
                    >
                      Reset Search
                    </button>
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
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
                          className={`card-lift group relative flex cursor-pointer flex-col rounded-2xl border bg-white p-5 text-left ${
                            isSelected
                              ? 'border-[#0A0A0C] ring-2 ring-[#0A0A0C]'
                              : 'border-[#E5E5E1] hover:border-[#0A0A0C]'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="rounded-full bg-[#F4F4F2] px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#52525B]">
                              {model.releaseYear}
                            </span>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                isSelected
                                  ? 'check-pop border-[#0A0A0C] bg-[#0A0A0C] text-white'
                                  : 'border-[#D4D4D0] bg-white group-hover:border-[#0A0A0C]'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </span>
                          </div>

                          <div className="my-4 flex h-40 w-full items-center justify-center overflow-hidden">
                            <img
                              src={model.image}
                              alt={model.name}
                              className="img-zoom h-full w-full object-contain"
                            />
                          </div>

                          <div>
                            <p className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                              {model.name}
                            </p>
                            <p className="mt-0.5 text-xs text-[#71717A]">
                              {model.storageOptions.map((s) => s.capacity).join(' / ')}
                            </p>
                            <div className="mt-3 flex items-center justify-between border-t border-[#F2F2EF] pt-3">
                              <div className="flex items-center gap-1">
                                {model.colors.slice(0, 4).map((c) => (
                                  <span
                                    key={c.name}
                                    title={c.name}
                                    style={{ backgroundColor: c.hex }}
                                    className="h-3 w-3 rounded-full border border-black/15"
                                  />
                                ))}
                              </div>
                              <span className="font-mono text-xs font-semibold text-[#0A0A0C] tabular-nums">
                                Up to {formatAed(maxVal)}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ---------------------------------------------------------------
                STEP 3: STORAGE SELECTION (Auto-advances on capacity click)
               --------------------------------------------------------------- */}
            {currentStep === 3 && selectedModel && (
              <section key="step-3" className={slideAnimationClass}>
                <div className="mb-7">
                  <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                    Step 03 · Capacity &amp; Finish
                  </p>
                  <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                    Select storage capacity.
                  </h1>
                  <p className="mt-2 text-sm text-[#52525B]">
                    Choose your finish if needed, then tap your storage size on{' '}
                    <strong className="text-[#0A0A0C]">{selectedModel.name}</strong> to proceed automatically.
                  </p>
                </div>

                {/* Optional Finish Swatches Above Storage so user can pick color before tapping capacity */}
                {selectedModel.colors.length > 0 && (
                  <div className="mb-6 rounded-2xl border border-[#E5E5E1] bg-white p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold tracking-[0.04em] text-[#71717A] uppercase">
                        Enclosure Finish (Optional)
                      </span>
                      <span className="font-mono text-xs font-medium text-[#0A0A0C]">
                        {selectedColor}
                      </span>
                    </div>
                    <div className="mt-3.5 flex flex-wrap gap-2.5">
                      {selectedModel.colors.map((c) => {
                        const active = selectedColor === c.name;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setSelectedColor(c.name)}
                            className={`btn-press flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium ${
                              active
                                ? 'border-[#0A0A0C] bg-[#0A0A0C] text-white'
                                : 'border-[#E4E4E0] bg-[#FAFAF9] text-[#0A0A0C] hover:border-[#0A0A0C]'
                            }`}
                          >
                            <span
                              style={{ backgroundColor: c.hex }}
                              className="h-3.5 w-3.5 rounded-full border border-black/20"
                            />
                            <span>{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Storage Variant Cards — Clicking advances immediately to Step 4 */}
                <div
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
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
                        className={`card-lift group flex cursor-pointer items-center justify-between rounded-2xl border bg-white p-6 text-left ${
                          isSelected
                            ? 'border-[#0A0A0C] ring-2 ring-[#0A0A0C]'
                            : 'border-[#E5E5E1] hover:border-[#0A0A0C]'
                        }`}
                      >
                        <div>
                          <p className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-[-0.03em] text-[#0A0A0C]">
                            {opt.capacity}
                          </p>
                          <p className="mt-1 font-mono text-xs text-[#52525B] tabular-nums">
                            Up to {formatAed(tierMaxPrice)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {opt.priceDeltaAed > 0 && (
                            <span className="rounded-full bg-[#F4F4F2] px-2.5 py-1 font-mono text-[11px] font-medium text-[#0A0A0C]">
                              +{formatAed(opt.priceDeltaAed)}
                            </span>
                          )}
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                              isSelected
                                ? 'check-pop border-[#0A0A0C] bg-[#0A0A0C] text-white'
                                : 'border-[#D4D4D0] bg-white group-hover:border-[#0A0A0C]'
                            }`}
                          >
                            {isSelected ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowRight className="h-3 w-3 text-[#71717A] opacity-0 transition-opacity group-hover:opacity-100" />
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ---------------------------------------------------------------
                STEP 4: CONDITION SELECTION (Auto-advances on click)
               --------------------------------------------------------------- */}
            {currentStep === 4 && selectedModel && selectedStorage && (
              <section key="step-4" className={slideAnimationClass}>
                <div className="mb-7">
                  <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                    Step 04 · Cosmetic Grade
                  </p>
                  <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                    Select overall condition.
                  </h1>
                  <p className="mt-2 text-sm text-[#52525B]">
                    Tap the overall grade of your {selectedModel.name} to continue to quick step-by-step evaluation.
                  </p>
                </div>

                <div
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                  role="radiogroup"
                  aria-label="Device condition"
                >
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
                        className={`card-lift group flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-6 text-left ${
                          isSelected
                            ? 'border-[#0A0A0C] ring-2 ring-[#0A0A0C]'
                            : 'border-[#E5E5E1] hover:border-[#0A0A0C]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                style={{ backgroundColor: tier.indicatorHex }}
                                className="h-2.5 w-2.5 rounded-full"
                              />
                              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-[#52525B] uppercase">
                                {tier.shortLabel}
                              </span>
                            </div>

                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                isSelected
                                  ? 'check-pop border-[#0A0A0C] bg-[#0A0A0C] text-white'
                                  : 'border-[#D4D4D0] bg-white group-hover:border-[#0A0A0C]'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowRight className="h-3 w-3 text-[#71717A] opacity-0 transition-opacity group-hover:opacity-100" />
                              )}
                            </span>
                          </div>

                          <div className="mt-3 flex items-baseline justify-between gap-2">
                            <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0A0A0C]">
                              {tier.title}
                            </h2>
                            <span className="font-mono text-sm font-bold text-[#0A0A0C] tabular-nums">
                              {formatAed(previewVal.finalEstimateAed)}
                            </span>
                          </div>

                          <p className="mt-2 text-xs leading-relaxed text-[#52525B]">
                            {tier.summary}
                          </p>
                        </div>

                        <ul className="mt-5 space-y-2 border-t border-[#F1F1EE] pt-4">
                          {tier.criteria.map((line) => (
                            <li
                              key={line}
                              className="flex items-start gap-2 text-xs text-[#3F3F46]"
                            >
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0A0A0C]" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ---------------------------------------------------------------
                STEP 5: STEP-BY-STEP GUIDED DEVICE EVALUATION (Sub-steps 1..6)
               --------------------------------------------------------------- */}
            {currentStep === 5 && selectedModel && (
              <section key="step-5" className="space-y-6">
                {/* Interactive Evaluation Sub-Stepper Pills */}
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E5E5E1] bg-white p-2.5">
                  {EVAL_SUBSTEPS.map((subItem) => {
                    const active = evalSubStep === subItem.sub;
                    const done = evalSubStep > subItem.sub;
                    return (
                      <button
                        key={subItem.sub}
                        type="button"
                        onClick={() => navigateToStep(5, subItem.sub)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                          active
                            ? 'bg-[#0A0A0C] text-white shadow-xs'
                            : done
                              ? 'bg-[#F4F4F2] text-[#0A0A0C] hover:bg-[#EAEAE6]'
                              : 'text-[#71717A] hover:bg-[#F8F8F6] hover:text-[#0A0A0C]'
                        }`}
                      >
                        <span className="font-mono text-[10px]">
                          {done ? '✓' : `${subItem.sub}/6`}
                        </span>
                        <span>{subItem.short}</span>
                      </button>
                    );
                  })}
                </div>

                {/* SUB-STEP 5.1: BATTERY HEALTH (Click auto-advances to 5.2) */}
                {evalSubStep === 1 && (
                  <div key="eval-1" className={slideAnimationClass}>
                    <div className="mb-6">
                      <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                        Evaluation 01 of 06 · Battery
                      </p>
                      <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                        What is your battery health?
                      </h1>
                      <p className="mt-2 text-sm text-[#52525B]">
                        Tap your battery maximum capacity percentage to continue automatically.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {(
                        [
                          {
                            id: '90-100' as BatteryHealthTier,
                            title: '90% – 100%',
                            sub: 'Optimal peak battery capacity',
                            badge: 'Full Value',
                          },
                          {
                            id: '80-89' as BatteryHealthTier,
                            title: '80% – 89%',
                            sub: 'Standard daily battery wear',
                            badge: '-AED 90',
                          },
                          {
                            id: 'below-80' as BatteryHealthTier,
                            title: 'Below 80%',
                            sub: 'Battery service recommended',
                            badge: '-AED 210',
                          },
                        ] as const
                      ).map((opt) => {
                        const active = evaluation.batteryHealth === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectBattery(opt.id)}
                            className={`card-lift group flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-6 text-left ${
                              active
                                ? 'border-[#0A0A0C] ring-2 ring-[#0A0A0C]'
                                : 'border-[#E5E5E1] hover:border-[#0A0A0C]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <BatteryCharging className="h-5 w-5 text-[#0A0A0C]" />
                              <span className="rounded-full bg-[#F4F4F2] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#52525B]">
                                {opt.badge}
                              </span>
                            </div>

                            <div className="mt-6">
                              <p className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-[#0A0A0C]">
                                {opt.title}
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-[#71717A]">
                                {opt.sub}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SUB-STEP 5.2: SCREEN & DISPLAY (Click auto-advances to 5.3) */}
                {evalSubStep === 2 && (
                  <div key="eval-2" className={slideAnimationClass}>
                    <div className="mb-6">
                      <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                        Evaluation 02 of 06 · Display
                      </p>
                      <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                        How is the screen &amp; display?
                      </h1>
                      <p className="mt-2 text-sm text-[#52525B]">
                        Inspect the front glass under bright light and tap the matching state.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {(
                        [
                          {
                            id: 'pristine' as ScreenStatus,
                            title: 'Original & Flawless',
                            sub: 'Zero scratches, uniform bright OLED, responsive touch',
                          },
                          {
                            id: 'micro-scratches' as ScreenStatus,
                            title: 'Faint Hairline Marks',
                            sub: 'Invisible when display is illuminated; zero cracks',
                          },
                          {
                            id: 'visible-wear' as ScreenStatus,
                            title: 'Visible Scratches or Minor Spot',
                            sub: 'Noticeable surface scratches or faint pixel mark',
                          },
                          {
                            id: 'cracked' as ScreenStatus,
                            title: 'Cracked Glass or OLED Line',
                            sub: 'Chipped glass, display lines, or screen burn-in',
                          },
                        ] as const
                      ).map((opt) => {
                        const active = evaluation.screenStatus === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectScreen(opt.id)}
                            className={`card-lift group flex cursor-pointer items-start justify-between gap-4 rounded-2xl border bg-white p-6 text-left ${
                              active
                                ? 'border-[#0A0A0C] ring-2 ring-[#0A0A0C]'
                                : 'border-[#E5E5E1] hover:border-[#0A0A0C]'
                            }`}
                          >
                            <div>
                              <Smartphone className="h-5 w-5 text-[#0A0A0C]" />
                              <p className="mt-4 font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                                {opt.title}
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-[#71717A]">
                                {opt.sub}
                              </p>
                            </div>
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                active
                                  ? 'check-pop border-[#0A0A0C] bg-[#0A0A0C] text-white'
                                  : 'border-[#D4D4D0] bg-white group-hover:border-[#0A0A0C]'
                              }`}
                            >
                              {active && <Check className="h-3.5 w-3.5" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SUB-STEP 5.3: FRAME & ENCLOSURE (Click auto-advances to 5.4) */}
                {evalSubStep === 3 && (
                  <div key="eval-3" className={slideAnimationClass}>
                    <div className="mb-6">
                      <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                        Evaluation 03 of 06 · Enclosure
                      </p>
                      <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                        How is the frame &amp; back glass?
                      </h1>
                      <p className="mt-2 text-sm text-[#52525B]">
                        Check the side rails, corners, and rear panel of your phone.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {(
                        [
                          {
                            id: 'spotless' as BodyStatus,
                            title: 'Spotless Enclosure',
                            sub: 'Zero scuffs, corner nicks, or rear glass marks',
                          },
                          {
                            id: 'light-scuffs' as BodyStatus,
                            title: 'Light Surface Scuffs',
                            sub: 'Minor case rub or faint pocket wear on edges',
                          },
                          {
                            id: 'dents-cracks' as BodyStatus,
                            title: 'Dents or Cracked Back',
                            sub: 'Visible corner dent or fractured rear glass panel',
                          },
                        ] as const
                      ).map((opt) => {
                        const active = evaluation.bodyStatus === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectBody(opt.id)}
                            className={`card-lift group flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-6 text-left ${
                              active
                                ? 'border-[#0A0A0C] ring-2 ring-[#0A0A0C]'
                                : 'border-[#E5E5E1] hover:border-[#0A0A0C]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Layers className="h-5 w-5 text-[#0A0A0C]" />
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                  active
                                    ? 'check-pop border-[#0A0A0C] bg-[#0A0A0C] text-white'
                                    : 'border-[#D4D4D0] bg-white group-hover:border-[#0A0A0C]'
                                }`}
                              >
                                {active && <Check className="h-3.5 w-3.5" />}
                              </span>
                            </div>

                            <div className="mt-6">
                              <p className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                                {opt.title}
                              </p>
                              <p className="mt-1.5 text-xs leading-relaxed text-[#71717A]">
                                {opt.sub}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SUB-STEP 5.4: CORE FUNCTIONALITY (Click auto-advances to 5.5) */}
                {evalSubStep === 4 && (
                  <div key="eval-4" className={slideAnimationClass}>
                    <div className="mb-6">
                      <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                        Evaluation 04 of 06 · Hardware Function
                      </p>
                      <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                        Does everything function properly?
                      </h1>
                      <p className="mt-2 text-sm text-[#52525B]">
                        Confirm whether calls, Wi-Fi, Bluetooth, GPS, and sensors operate normally.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {(
                        [
                          {
                            id: 'fully-working' as FunctionalStatus,
                            title: 'Yes, 100% Functional',
                            sub: 'Powers on cleanly; calls, wireless radios, cameras, and biometrics work as intended.',
                          },
                          {
                            id: 'minor-issue' as FunctionalStatus,
                            title: 'Has Functional Faults',
                            sub: 'One or more sensors, buttons, speakers, or ports need attention.',
                          },
                        ] as const
                      ).map((opt) => {
                        const active = evaluation.functionalStatus === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectFunctionality(opt.id)}
                            className={`card-lift group flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-7 text-left ${
                              active
                                ? 'border-[#0A0A0C] ring-2 ring-[#0A0A0C]'
                                : 'border-[#E5E5E1] hover:border-[#0A0A0C]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Cpu className="h-5 w-5 text-[#0A0A0C]" />
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                  active
                                    ? 'check-pop border-[#0A0A0C] bg-[#0A0A0C] text-white'
                                    : 'border-[#D4D4D0] bg-white group-hover:border-[#0A0A0C]'
                                }`}
                              >
                                {active && <Check className="h-3.5 w-3.5" />}
                              </span>
                            </div>

                            <div className="mt-6">
                              <p className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0A0A0C]">
                                {opt.title}
                              </p>
                              <p className="mt-1.5 text-xs leading-relaxed text-[#52525B]">
                                {opt.sub}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SUB-STEP 5.5: KNOWN ISSUES (Clicking "No Known Issues" auto-advances to 5.6!) */}
                {evalSubStep === 5 && (
                  <div key="eval-5" className={slideAnimationClass}>
                    <div className="mb-6">
                      <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                        Evaluation 05 of 06 · Known Issues
                      </p>
                      <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                        Any specific known issues?
                      </h1>
                      <p className="mt-2 text-sm text-[#52525B]">
                        Tap <strong>No Known Issues</strong> to move straight ahead, or select any specific faults below.
                      </p>
                    </div>

                    {/* Instant Auto-Advance Primary Card: No Known Issues */}
                    <button
                      type="button"
                      onClick={handleNoKnownIssues}
                      className={`card-lift group mb-5 flex w-full cursor-pointer items-center justify-between rounded-2xl border p-5 text-left ${
                        evaluation.knownIssues.length === 0
                          ? 'border-[#0A0A0C] bg-white ring-2 ring-[#0A0A0C]'
                          : 'border-[#E5E5E1] bg-white hover:border-[#0A0A0C]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
                          <CheckCircle2 className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                            No Known Issues — Continue
                          </p>
                          <p className="text-xs text-[#52525B]">
                            Cameras, Face ID / Touch ID, speakers, charging port, and SIM are all normal
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#0A0A0C] transition-transform duration-200 group-hover:translate-x-1" />
                    </button>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {KNOWN_ISSUES_CATALOG.map((issue) => {
                        const checked = evaluation.knownIssues.includes(issue.id);
                        return (
                          <button
                            key={issue.id}
                            type="button"
                            onClick={() => toggleKnownIssue(issue.id)}
                            className={`card-lift flex cursor-pointer items-start justify-between gap-3 rounded-2xl border bg-white p-4.5 text-left ${
                              checked
                                ? 'border-[#0A0A0C] bg-[#FAFAF9] ring-2 ring-[#0A0A0C]'
                                : 'border-[#E5E5E1] hover:border-[#0A0A0C]'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#71717A]" />
                              <div>
                                <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0A0A0C]">
                                  {issue.label}
                                </p>
                                <p className="mt-0.5 text-[11px] text-[#71717A]">
                                  {issue.description}
                                </p>
                              </div>
                            </div>
                            <span className="shrink-0 font-mono text-[11px] font-medium text-[#52525B]">
                              -{formatAed(issue.deductionAed)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {evaluation.knownIssues.length > 0 && (
                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={() => navigateToStep(5, 6)}
                          className="btn-press btn-sheen inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0A0A0C] px-7 py-3.5 text-xs font-bold tracking-[0.06em] text-white uppercase"
                        >
                          <span>
                            Continue with {evaluation.knownIssues.length} Selected
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-STEP 5.6: INCLUDED EXTRAS & WARRANTY (Finish -> Step 6 Estimate) */}
                {evalSubStep === 6 && (
                  <div key="eval-6" className={slideAnimationClass}>
                    <div className="mb-6">
                      <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                        Evaluation 06 of 06 · Value Boosters
                      </p>
                      <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                        Do you have the box or warranty?
                      </h1>
                      <p className="mt-2 text-sm text-[#52525B]">
                        Add optional value boosters below, or tap <strong>Phone Only</strong> to view your AED estimate immediately.
                      </p>
                    </div>

                    {/* Quick Auto-Advance Option: Phone Only */}
                    <button
                      type="button"
                      onClick={handleNoExtrasFinish}
                      className="card-lift group mb-5 flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[#E5E5E1] bg-white p-5 text-left hover:border-[#0A0A0C]"
                    >
                      <div>
                        <p className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                          Phone Only — View My AED Estimate
                        </p>
                        <p className="mt-0.5 text-xs text-[#52525B]">
                          Selling the handset without retail box or extra accessories
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#0A0A0C] transition-transform duration-200 group-hover:translate-x-1" />
                    </button>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {ACCESSORY_BONUSES.map((acc) => {
                        const checked = evaluation.accessories.includes(acc.id);
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => toggleAccessory(acc.id)}
                            className={`card-lift cursor-pointer rounded-2xl border p-5 text-left ${
                              checked
                                ? 'border-[#059669] bg-[#ECFDF5]/60 ring-2 ring-[#059669]'
                                : 'border-[#E5E5E1] bg-white hover:border-[#0A0A0C]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#059669]">
                                <PackageCheck className="h-3.5 w-3.5" />+{formatAed(acc.bonusAed)}
                              </span>
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                  checked
                                    ? 'check-pop border-[#059669] bg-[#059669] text-white'
                                    : 'border-[#D4D4D0] bg-white'
                                }`}
                              >
                                {checked && <Check className="h-3 w-3" />}
                              </span>
                            </div>
                            <p className="mt-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0A0A0C]">
                              {acc.label}
                            </p>
                            <p className="mt-1 text-xs text-[#52525B]">{acc.description}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-7 flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigateToStep(6)}
                        className="btn-press btn-sheen inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0A0A0C] px-8 py-4 text-xs font-bold tracking-[0.06em] text-white uppercase hover:bg-[#232326]"
                      >
                        <span>Calculate My AED Estimate</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ---------------------------------------------------------------
                STEP 6: PRICE ESTIMATION (HIGH VISUAL EMPHASIS)
               --------------------------------------------------------------- */}
            {currentStep === 6 && selectedModel && selectedBrand && selectedStorage && liveValuation && (
              <section key="step-6" className={`${slideAnimationClass} space-y-6`}>
                <div>
                  <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                    Step 06 · Instant Valuation Summary
                  </p>
                  <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                    Your estimated buyback price.
                  </h1>
                </div>

                {/* Hero Valuation Vault */}
                <div className="overflow-hidden rounded-3xl border border-[#0A0A0C] bg-[#0A0A0C] text-white shadow-[0_18px_45px_rgba(10,10,12,0.12)]">
                  <div className="grid grid-cols-1 items-center gap-8 p-8 sm:p-10 md:grid-cols-12">
                    <div className="md:col-span-8">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 font-mono text-[11px] font-medium text-[#E4E4E7]">
                        <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
                        <span>Guaranteed for {liveValuation.priceLockDays} Days · UAE Dirhams</span>
                      </div>

                      <p className="mt-6 text-xs font-medium tracking-[0.14em] text-[#A1A1AA] uppercase">
                        Estimated Payout
                      </p>
                      <p className="mt-2 font-['Plus_Jakarta_Sans'] text-5xl font-extrabold tracking-[-0.04em] text-white sm:text-6xl">
                        <AnimatedAed amount={liveValuation.finalEstimateAed} />
                      </p>

                      <p className="mt-4 text-sm text-[#D4D4D8]">
                        {selectedBrand.name} {selectedModel.name} · {selectedStorage} · {selectedColor}
                      </p>

                      <div className="mt-7 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => navigateToStep(7)}
                          className="btn-press inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-7 py-3.5 text-xs font-bold tracking-[0.06em] text-[#0A0A0C] uppercase hover:bg-[#E4E4E7]"
                        >
                          <span>Proceed to Sell</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateToStep(5, 1)}
                          className="btn-press inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/25 px-5 py-3.5 text-xs font-semibold text-white hover:border-white"
                        >
                          Adjust Evaluation
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-center md:col-span-4">
                      <div className="flex h-48 w-44 items-center justify-center rounded-2xl bg-white p-4">
                        <img
                          src={selectedModel.image}
                          alt={selectedModel.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transparent Itemized Price Ledger */}
                <div className="rounded-3xl border border-[#E5E5E1] bg-white p-7 sm:p-8">
                  <div className="flex items-center justify-between border-b border-[#ECECE8] pb-4">
                    <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                      Valuation Calculation Breakdown
                    </h2>
                    <span className="font-mono text-xs text-[#71717A]">Zero Platform Fees</span>
                  </div>

                  <div className="mt-4 divide-y divide-[#F2F2EF]">
                    {liveValuation.lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3.5 text-sm"
                      >
                        <div>
                          <p className="font-medium text-[#0A0A0C]">{item.label}</p>
                          {item.detail && (
                            <p className="text-xs text-[#71717A]">{item.detail}</p>
                          )}
                        </div>
                        <span
                          className={`font-mono font-semibold tabular-nums ${
                            item.kind === 'addition'
                              ? 'text-[#059669]'
                              : item.kind === 'deduction'
                                ? 'text-[#52525B]'
                                : 'text-[#0A0A0C]'
                          }`}
                        >
                          {item.amountAed >= 0
                            ? item.kind === 'addition'
                              ? `+${formatAed(item.amountAed)}`
                              : formatAed(item.amountAed)
                            : `-${formatAed(Math.abs(item.amountAed))}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#0A0A0C] pt-4">
                    <span className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                      Total Guaranteed Offer
                    </span>
                    <span className="font-mono text-xl font-extrabold text-[#0A0A0C] tabular-nums">
                      {formatAed(liveValuation.finalEstimateAed)}
                    </span>
                  </div>
                </div>

                {/* Quick Edit Previous Steps Strip */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => navigateToStep(2)}
                    className="card-lift cursor-pointer rounded-2xl border border-[#E5E5E1] bg-white p-4 text-left hover:border-[#0A0A0C]"
                  >
                    <p className="font-mono text-[10px] text-[#71717A] uppercase">Edit Model</p>
                    <p className="mt-1 truncate text-xs font-bold text-[#0A0A0C]">
                      {selectedModel.name}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToStep(3)}
                    className="card-lift cursor-pointer rounded-2xl border border-[#E5E5E1] bg-white p-4 text-left hover:border-[#0A0A0C]"
                  >
                    <p className="font-mono text-[10px] text-[#71717A] uppercase">Edit Storage</p>
                    <p className="mt-1 text-xs font-bold text-[#0A0A0C]">{selectedStorage}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToStep(4)}
                    className="card-lift cursor-pointer rounded-2xl border border-[#E5E5E1] bg-white p-4 text-left hover:border-[#0A0A0C]"
                  >
                    <p className="font-mono text-[10px] text-[#71717A] uppercase">Edit Condition</p>
                    <p className="mt-1 text-xs font-bold text-[#0A0A0C] capitalize">
                      {activeConditionForCalc}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToStep(5, 1)}
                    className="card-lift cursor-pointer rounded-2xl border border-[#E5E5E1] bg-white p-4 text-left hover:border-[#0A0A0C]"
                  >
                    <p className="font-mono text-[10px] text-[#71717A] uppercase">Edit Battery</p>
                    <p className="mt-1 text-xs font-bold text-[#0A0A0C]">
                      {evaluation.batteryHealth === 'below-80'
                        ? 'Below 80%'
                        : `${evaluation.batteryHealth}%`}
                    </p>
                  </button>
                </div>
              </section>
            )}

            {/* ---------------------------------------------------------------
                STEP 7: SELLING SUBMISSION
               --------------------------------------------------------------- */}
            {currentStep === 7 && selectedModel && selectedBrand && selectedStorage && liveValuation && (
              <section key="step-7" className={slideAnimationClass}>
                <div className="mb-7">
                  <p className="font-mono text-xs font-medium tracking-[0.14em] text-[#71717A] uppercase">
                    Step 07 · Pickup &amp; Payout Details
                  </p>
                  <h1 className="mt-1.5 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-[-0.035em] text-[#0A0A0C] sm:text-4xl">
                    Complete your sell request.
                  </h1>
                  <p className="mt-2 text-sm text-[#52525B]">
                    Schedule complimentary courier collection anywhere in the UAE and select how you would like to receive your{' '}
                    <strong className="text-[#0A0A0C]">
                      {formatAed(liveValuation.finalEstimateAed)}
                    </strong>{' '}
                    payout.
                  </p>
                </div>

                <form onSubmit={validateAndSubmit} noValidate className="space-y-6">
                  <div className="rounded-3xl border border-[#E5E5E1] bg-white p-6 sm:p-8">
                    <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                      Seller Contact Details
                    </h2>
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="seller-name"
                          className="block text-xs font-semibold text-[#0A0A0C]"
                        >
                          Full Name
                        </label>
                        <input
                          id="seller-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Rashid Al Maktoum"
                          className="mt-1.5 h-12 w-full rounded-xl border border-[#D8D8D4] bg-white px-4 text-sm text-[#0A0A0C] transition-colors focus:border-[#0A0A0C] focus:outline-none"
                        />
                        {formErrors.fullName && (
                          <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                            {formErrors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="seller-phone"
                          className="block text-xs font-semibold text-[#0A0A0C]"
                        >
                          UAE Mobile Number
                        </label>
                        <input
                          id="seller-phone"
                          type="tel"
                          value={phoneUae}
                          onChange={(e) => setPhoneUae(e.target.value)}
                          placeholder="+971 50 123 4567"
                          className="mt-1.5 h-12 w-full rounded-xl border border-[#D8D8D4] bg-white px-4 text-sm text-[#0A0A0C] transition-colors focus:border-[#0A0A0C] focus:outline-none"
                        />
                        {formErrors.phoneUae && (
                          <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                            {formErrors.phoneUae}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="seller-email"
                          className="block text-xs font-semibold text-[#0A0A0C]"
                        >
                          Email Address
                        </label>
                        <input
                          id="seller-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@domain.ae"
                          className="mt-1.5 h-12 w-full rounded-xl border border-[#D8D8D4] bg-white px-4 text-sm text-[#0A0A0C] transition-colors focus:border-[#0A0A0C] focus:outline-none"
                        />
                        {formErrors.email && (
                          <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                            {formErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <span className="block text-xs font-semibold text-[#0A0A0C]">
                          Device Regional Version
                        </span>
                        <div className="mt-2 flex flex-wrap gap-3">
                          {(['UAE TDRA', 'International'] as const).map((reg) => (
                            <button
                              key={reg}
                              type="button"
                              onClick={() => setDeviceSpecRegion(reg)}
                              className={`btn-press cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold ${
                                deviceSpecRegion === reg
                                  ? 'border-[#0A0A0C] bg-[#0A0A0C] text-white'
                                  : 'border-[#D8D8D4] bg-white text-[#52525B] hover:border-[#0A0A0C]'
                              }`}
                            >
                              {reg} Spec
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* UAE Pickup Location & Slot */}
                  <div className="rounded-3xl border border-[#E5E5E1] bg-white p-6 sm:p-8">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#0A0A0C]" />
                      <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                        UAE Collection Address &amp; Window
                      </h2>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="seller-emirate"
                          className="block text-xs font-semibold text-[#0A0A0C]"
                        >
                          Emirate
                        </label>
                        <select
                          id="seller-emirate"
                          value={emirate}
                          onChange={(e) => setEmirate(e.target.value as UAEEmirate)}
                          className="mt-1.5 h-12 w-full rounded-xl border border-[#D8D8D4] bg-white px-4 text-sm text-[#0A0A0C] focus:border-[#0A0A0C] focus:outline-none"
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
                          className="block text-xs font-semibold text-[#0A0A0C]"
                        >
                          Community &amp; Street
                        </label>
                        <input
                          id="seller-area"
                          type="text"
                          value={areaAndStreet}
                          onChange={(e) => setAreaAndStreet(e.target.value)}
                          placeholder="e.g. Downtown Dubai, Sheikh Mohammed bin Rashid Blvd"
                          className="mt-1.5 h-12 w-full rounded-xl border border-[#D8D8D4] bg-white px-4 text-sm text-[#0A0A0C] focus:border-[#0A0A0C] focus:outline-none"
                        />
                        {formErrors.areaAndStreet && (
                          <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                            {formErrors.areaAndStreet}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="seller-building"
                          className="block text-xs font-semibold text-[#0A0A0C]"
                        >
                          Building / Tower / Villa &amp; Apartment
                        </label>
                        <input
                          id="seller-building"
                          type="text"
                          value={buildingOrVilla}
                          onChange={(e) => setBuildingOrVilla(e.target.value)}
                          placeholder="e.g. Boulevard Point Tower, Apt 1804"
                          className="mt-1.5 h-12 w-full rounded-xl border border-[#D8D8D4] bg-white px-4 text-sm text-[#0A0A0C] focus:border-[#0A0A0C] focus:outline-none"
                        />
                        {formErrors.buildingOrVilla && (
                          <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                            {formErrors.buildingOrVilla}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-[#0A0A0C]" />
                        <span className="text-xs font-semibold text-[#0A0A0C]">
                          Preferred Collection Window
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {(
                          [
                            {
                              id: 'today-evening' as PickupSlot,
                              day: 'Today',
                              hours: '6:00 PM – 9:00 PM',
                            },
                            {
                              id: 'tomorrow-morning' as PickupSlot,
                              day: 'Tomorrow Morning',
                              hours: '10:00 AM – 1:00 PM',
                            },
                            {
                              id: 'tomorrow-evening' as PickupSlot,
                              day: 'Tomorrow Evening',
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
                              className={`card-lift cursor-pointer rounded-xl border p-4 text-left ${
                                active
                                  ? 'border-[#0A0A0C] bg-[#FAFAF9] ring-2 ring-[#0A0A0C]'
                                  : 'border-[#E5E5E1] bg-white hover:border-[#0A0A0C]'
                              }`}
                            >
                              <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0A0A0C]">
                                {slot.day}
                              </p>
                              <p className="mt-1 font-mono text-[11px] text-[#52525B]">
                                {slot.hours}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Payout Method Selection */}
                  <div className="rounded-3xl border border-[#E5E5E1] bg-white p-6 sm:p-8">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-[#0A0A0C]" />
                      <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0A0A0C]">
                        AED Payout Method
                      </h2>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {(
                        [
                          {
                            id: 'uae-bank-iban' as PayoutMethod,
                            title: 'UAE Bank IBAN',
                            desc: 'Instant local transfer in AED',
                          },
                          {
                            id: 'instant-cash' as PayoutMethod,
                            title: 'Cash on Pickup',
                            desc: 'Paid in AED notes at handover',
                          },
                          {
                            id: 'digital-wallet' as PayoutMethod,
                            title: 'Digital Wallet',
                            desc: 'Instant UAE wallet transfer',
                          },
                        ] as const
                      ).map((pm) => {
                        const active = payoutMethod === pm.id;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPayoutMethod(pm.id)}
                            className={`card-lift cursor-pointer rounded-xl border p-4 text-left ${
                              active
                                ? 'border-[#0A0A0C] bg-[#FAFAF9] ring-2 ring-[#0A0A0C]'
                                : 'border-[#E5E5E1] bg-white hover:border-[#0A0A0C]'
                            }`}
                          >
                            <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0A0A0C]">
                              {pm.title}
                            </p>
                            <p className="mt-1 text-[11px] text-[#71717A]">{pm.desc}</p>
                          </button>
                        );
                      })}
                    </div>

                    {payoutMethod === 'uae-bank-iban' && (
                      <div className="route-enter mt-5">
                        <label
                          htmlFor="seller-iban"
                          className="block text-xs font-semibold text-[#0A0A0C]"
                        >
                          UAE IBAN (Optional now — can also be provided to specialist at pickup)
                        </label>
                        <input
                          id="seller-iban"
                          type="text"
                          value={ibanOptional}
                          onChange={(e) => setIbanOptional(e.target.value)}
                          placeholder="AE07 0331 2345 6789 0123 456"
                          className="mt-1.5 h-12 w-full rounded-xl border border-[#D8D8D4] bg-white px-4 font-mono text-xs text-[#0A0A0C] focus:border-[#0A0A0C] focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="mt-5">
                      <label
                        htmlFor="seller-notes"
                        className="block text-xs font-semibold text-[#0A0A0C]"
                      >
                        Courier Gate / Reception Note (Optional)
                      </label>
                      <input
                        id="seller-notes"
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Call upon arrival at security gate"
                        className="mt-1.5 h-12 w-full rounded-xl border border-[#D8D8D4] bg-white px-4 text-sm text-[#0A0A0C] focus:border-[#0A0A0C] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => navigateToStep(6)}
                      className="btn-press inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D4D4D0] bg-white px-6 py-3.5 text-xs font-semibold text-[#0A0A0C] hover:border-[#0A0A0C]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Estimate
                    </button>

                    <button
                      type="submit"
                      className="btn-press btn-sheen inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0A0A0C] px-8 py-4 text-xs font-bold tracking-[0.08em] text-white uppercase hover:bg-[#232326]"
                    >
                      <span>Confirm &amp; Lock {formatAed(liveValuation.finalEstimateAed)}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>

          {/* =================================================================
              RIGHT STICKY LIVE CONFIGURATION & VALUATION RAIL (4 COLS)
             ================================================================= */}
          <aside className="lg:sticky lg:top-24 lg:col-span-4">
            <div className="overflow-hidden rounded-3xl border border-[#E5E5E1] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
              <div className="flex items-center justify-between border-b border-[#F1F1EE] pb-4">
                <span className="font-mono text-[11px] font-semibold tracking-[0.12em] text-[#71717A] uppercase">
                  Your Configuration
                </span>
                <span className="font-mono text-[11px] font-medium text-[#71717A]">
                  Step 0{currentStep}/07
                </span>
              </div>

              {/* Studio Device Visual Stage */}
              <div className="my-5 flex h-44 items-center justify-center rounded-2xl bg-[#FAFAF9] p-4">
                {selectedModel ? (
                  <img
                    key={selectedModel.id}
                    src={selectedModel.image}
                    alt={selectedModel.name}
                    className="route-enter h-full w-full object-contain"
                  />
                ) : selectedBrand ? (
                  <div key={selectedBrand.id} className="route-enter flex flex-col items-center gap-3">
                    <BrandLogo
                      brandId={selectedBrand.id}
                      className={
                        selectedBrand.id === 'google' || selectedBrand.id === 'xiaomi'
                          ? 'h-12 w-12'
                          : 'h-9 max-w-[140px]'
                      }
                    />
                    <span className="font-mono text-[11px] text-[#71717A]">
                      Select a {selectedBrand.name} model
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <Smartphone className="mx-auto h-8 w-8 text-[#A1A1AA]" strokeWidth={1.5} />
                    <p className="mt-2 text-xs text-[#71717A]">
                      Tap a brand on the left to start configuring
                    </p>
                  </div>
                )}
              </div>

              {/* Live Summary Specification Rows with Quick Edit */}
              <dl className="divide-y divide-[#F2F2EF] text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[#71717A]">Brand</dt>
                  <dd className="flex items-center gap-2 font-semibold text-[#0A0A0C]">
                    <span>{selectedBrand ? selectedBrand.name : 'Not selected'}</span>
                    {selectedBrand && currentStep !== 1 && (
                      <button
                        type="button"
                        onClick={() => navigateToStep(1)}
                        className="cursor-pointer font-mono text-[10px] text-[#71717A] underline hover:text-[#0A0A0C]"
                      >
                        Edit
                      </button>
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[#71717A]">Model</dt>
                  <dd className="flex items-center gap-2 font-semibold text-[#0A0A0C]">
                    <span className="max-w-[150px] truncate">
                      {selectedModel ? selectedModel.name : '—'}
                    </span>
                    {selectedModel && currentStep !== 2 && (
                      <button
                        type="button"
                        onClick={() => navigateToStep(2)}
                        className="cursor-pointer font-mono text-[10px] text-[#71717A] underline hover:text-[#0A0A0C]"
                      >
                        Edit
                      </button>
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[#71717A]">Storage</dt>
                  <dd className="flex items-center gap-2 font-semibold text-[#0A0A0C]">
                    <span>{selectedStorage ?? '—'}</span>
                    {selectedStorage && currentStep > 3 && (
                      <button
                        type="button"
                        onClick={() => navigateToStep(3)}
                        className="cursor-pointer font-mono text-[10px] text-[#71717A] underline hover:text-[#0A0A0C]"
                      >
                        Edit
                      </button>
                    )}
                  </dd>
                </div>

                {selectedCondition && selectedModel && (
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-[#71717A]">Condition</dt>
                    <dd className="flex items-center gap-2 font-semibold text-[#0A0A0C] capitalize">
                      <span>{selectedCondition}</span>
                      {currentStep > 4 && (
                        <button
                          type="button"
                          onClick={() => navigateToStep(4)}
                          className="cursor-pointer font-mono text-[10px] text-[#71717A] underline hover:text-[#0A0A0C]"
                        >
                          Edit
                        </button>
                      )}
                    </dd>
                  </div>
                )}

                {currentStep >= 5 && selectedModel && (
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-[#71717A]">Battery Health</dt>
                    <dd className="flex items-center gap-2 font-semibold text-[#0A0A0C]">
                      <span>
                        {evaluation.batteryHealth === 'below-80'
                          ? 'Below 80%'
                          : `${evaluation.batteryHealth}%`}
                      </span>
                      {currentStep > 5 && (
                        <button
                          type="button"
                          onClick={() => navigateToStep(5, 1)}
                          className="cursor-pointer font-mono text-[10px] text-[#71717A] underline hover:text-[#0A0A0C]"
                        >
                          Edit
                        </button>
                      )}
                    </dd>
                  </div>
                )}
              </dl>

              {/* Prominent Live Price Box */}
              <div className="mt-5 rounded-2xl bg-[#0A0A0C] p-5 text-white">
                <p className="font-mono text-[10px] tracking-[0.12em] text-[#A1A1AA] uppercase">
                  {!selectedModel
                    ? 'Instant Quote'
                    : currentStep <= 2
                      ? 'Max Model Value'
                      : 'Live Buyback Estimate'}
                </p>
                <p className="mt-1.5 font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-[-0.03em] text-white">
                  {liveValuation ? (
                    currentStep <= 2 ? (
                      <AnimatedAed amount={liveValuation.maxPossibleAed} prefix="Up to " />
                    ) : (
                      <AnimatedAed amount={liveValuation.finalEstimateAed} />
                    )
                  ) : (
                    <span className="text-lg font-semibold text-[#E4E4E7]">
                      Select device to calculate
                    </span>
                  )}
                </p>
                <p className="mt-1 text-[11px] text-[#A1A1AA]">
                  Complimentary pickup across all 7 Emirates
                </p>
              </div>

              {/* Trust Footnotes */}
              <div className="mt-5 space-y-2.5 pt-1 text-xs text-[#52525B]">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#0A0A0C]" />
                  <span>Certified permanent data wipe</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 shrink-0 text-[#0A0A0C]" />
                  <span>Free doorstep courier or return</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};
