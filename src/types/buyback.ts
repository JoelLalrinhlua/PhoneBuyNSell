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

export type ConditionId = 'flawless' | 'good' | 'fair' | 'damaged';

export interface ConditionTier {
  id: ConditionId;
  title: string;
  shortLabel: string;
  summary: string;
  multiplier: number;
  criteria: string[];
  indicatorHex: string;
}

export type BatteryHealthTier = '90-100' | '80-89' | 'below-80';
export type ScreenStatus = 'pristine' | 'micro-scratches' | 'visible-wear' | 'cracked';
export type BodyStatus = 'spotless' | 'light-scuffs' | 'dents-cracks';
export type FunctionalStatus = 'fully-working' | 'minor-issue';

export type KnownIssueId =
  | 'camera-lens'
  | 'biometrics'
  | 'audio-mic'
  | 'charging-port'
  | 'buttons-haptics'
  | 'network-locked';

export type AccessoryBonusId = 'original-box' | 'original-cable' | 'uae-warranty';

export interface DeviceEvaluation {
  batteryHealth: BatteryHealthTier;
  screenStatus: ScreenStatus;
  bodyStatus: BodyStatus;
  functionalStatus: FunctionalStatus;
  knownIssues: KnownIssueId[];
  accessories: AccessoryBonusId[];
}

export interface ValuationLineItem {
  id: string;
  label: string;
  detail?: string;
  amountAed: number;
  kind: 'base' | 'addition' | 'deduction';
}

export interface ValuationBreakdown {
  currency: 'AED';
  maxPossibleAed: number;
  storageBaseAed: number;
  conditionAdjustedAed: number;
  diagnosticsDeltaAed: number;
  accessoriesBonusAed: number;
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
  status: 'pending_pickup' | 'inspecting' | 'completed';
  brandId: BrandId;
  brandName: string;
  modelId: string;
  modelName: string;
  storage: StorageCapacity;
  colorName: string;
  conditionId: ConditionId;
  conditionTitle: string;
  evaluation: DeviceEvaluation;
  valuation: ValuationBreakdown;
  seller: SellerContactDetails;
}
