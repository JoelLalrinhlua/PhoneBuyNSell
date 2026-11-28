export type BrandId =
  | 'apple'
  | 'google'
  | 'iqoo'
  | 'motorola'
  | 'nothing'
  | 'oneplus'
  | 'oppo'
  | 'poco'
  | 'realme'
  | 'samsung'
  | 'vivo'
  | 'xiaomi';

export type StorageCapacity = '128 GB' | '256 GB' | '512 GB' | '1 TB';

export interface StorageOption {
  capacity: StorageCapacity;
  priceDeltaAed: number;
}

export interface DeviceColor {
  name: string;
  hex: string;
}

export interface Brand {
  id: BrandId;
  name: string;
  maxPayoutAed: number;
  deviceCount: number;
}

export interface PhoneModel {
  id: string;
  brandId: BrandId;
  name: string;
  series: string;
  releaseYear: number;
  image: string;
  basePriceAed: number;
  storageOptions: StorageOption[];
  colors: DeviceColor[];
  popular?: boolean;
  specBadge?: string;
}

export type ConditionId =
  | 'zero-scratch'
  | 'small-scratch'
  | 'medium-scratch'
  | 'parts-change-genuine'
  | 'more-scratch-broken'
  | 'hardware-unknown-parts'
  | 'others-agent';

export interface ConditionTier {
  id: ConditionId;
  title: string;
  shortLabel: string;
  deductionAed: number | null; // null = Reply by agent
  summary: string;
  criteria: string[];
  indicatorHex: string;
}

export interface InspectionVideoConfig {
  /** Drop your video file in public/videos/ and set its path here (e.g. '/videos/inspection-guide.mp4'). */
  src: string;
  poster: string;
  durationLabel: string;
  title: string;
  subtitle: string;
  checkpoints: {
    step: string;
    title: string;
    detail: string;
  }[];
}

export interface ValuationLineItem {
  id: string;
  label: string;
  detail?: string;
  amountAed: number;
  kind: 'base' | 'deduction';
}

export interface ValuationBreakdown {
  currency: 'AED';
  isAgentQuote: boolean;
  appliedTierId: ConditionId;
  appliedTierTitle: string;
  maxPossibleAed: number;
  storageBaseAed: number;
  deductionAed: number;
  unitEstimateAed: number;
  quantity: number;
  finalEstimateAed: number;
  lineItems: ValuationLineItem[];
}

export type UAEEmirate =
  | 'Dubai'
  | 'Abu Dhabi'
  | 'Sharjah'
  | 'Ajman'
  | 'Ras Al Khaimah'
  | 'Fujairah'
  | 'Umm Al Quwain';

export type PickupSlot = 'today-evening' | 'tomorrow-morning' | 'tomorrow-evening';

/**
 * Pre-existing B2B partner account information created at registration
 * (managed at the account/admin level, read-only during phone sell submission).
 */
export interface B2BAccountProfile {
  accountCode: string;
  companyName: string;
  tradeLicenseEmirate: UAEEmirate;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  registeredAddress: string;
  settlementMethodLabel: string;
  maskedIban: string;
}

/**
 * Per-sale / per-consignment required fields entered when submitting phones.
 */
export interface B2BSaleSubmissionDetails {
  quantity: number;
  imeiOrBatchRef: string;
  deviceSpecRegion: 'UAE TDRA' | 'International';
  pickupSlot: PickupSlot;
  notes?: string;
}

export interface SellSubmissionRecord {
  referenceCode: string;
  createdAtIso: string;
  status: 'pending_pickup' | 'agent_quote_pending' | 'inspecting' | 'completed';
  brandId: BrandId | 'other';
  brandName: string;
  modelId: string;
  modelName: string;
  storage: StorageCapacity | 'Custom';
  colorName: string;
  conditionId: ConditionId;
  conditionTitle: string;
  valuation: ValuationBreakdown;
  account: B2BAccountProfile;
  saleDetails: B2BSaleSubmissionDetails;
}
