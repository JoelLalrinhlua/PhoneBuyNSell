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

export type BatteryHealthTier = '90-above' | '85-89' | 'below-85';

export type ScreenStatus =
  | 'no-scratch'
  | 'small-scratch'
  | 'medium-deep-scratch'
  | 'display-crack'
  | 'display-not-working';

export type BodyPartsStatus =
  | 'no-scratch-original'
  | 'small-body-scratch'
  | 'body-dent-scratch'
  | 'genuine-part-changed'
  | 'back-glass-broken-dent'
  | 'unknown-unofficial-part';

export type FunctionalStatus =
  | 'full-working'
  | 'mic-speaker-camera-dot'
  | 'faceid-hardware-issue'
  | 'other-agent-issue';

export interface DeviceEvaluation {
  batteryHealth: BatteryHealthTier;
  screenStatus: ScreenStatus;
  bodyPartsStatus: BodyPartsStatus;
  functionalStatus: FunctionalStatus;
  agentIssueDetails: string;
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
  finalEstimateAed: number;
  priceLockDays: number;
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

export type PayoutMethod = 'uae-bank-iban' | 'instant-cash' | 'digital-wallet';

export type PickupSlot = 'today-evening' | 'tomorrow-morning' | 'tomorrow-evening';

export interface SellerContactDetails {
  fullName: string;
  phoneUae: string;
  email: string;
  emirate: UAEEmirate;
  areaAndStreet: string;
  buildingOrVilla: string;
  pickupSlot: PickupSlot;
  payoutMethod: PayoutMethod;
  ibanOptional?: string;
  deviceSpecRegion: 'UAE TDRA' | 'International';
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
  evaluation: DeviceEvaluation;
  valuation: ValuationBreakdown;
  seller: SellerContactDetails;
}
