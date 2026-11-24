import { CONDITION_TIERS } from '../data/catalog';
import type {
  ConditionId,
  DeviceEvaluation,
  PhoneModel,
  StorageCapacity,
  ValuationBreakdown,
  ValuationLineItem,
} from '../types/buyback';

export function formatAed(amount: number): string {
  return `AED ${Math.round(amount).toLocaleString('en-US')}`;
}

export function getMaxModelPriceAed(model: PhoneModel): number {
  const maxStorageDelta = Math.max(...model.storageOptions.map((s) => s.priceDeltaAed), 0);
  return model.basePriceAed + maxStorageDelta;
}

/**
 * Resolves the exact arsouq condition tier & fixed AED deduction:
 *  - Zero Scratch (Flawless):           -AED 0
 *  - Small Scratch:                     -AED 150
 *  - Medium Scratch:                    -AED 400
 *  - Parts Change (Genuine Part):       -AED 500
 *  - More Scratch / Dent / Broken:      -AED 700
 *  - Hardware Issue / Unknown Parts:    -AED 1,000
 *  - Others:                            Reply by agent
 */
export function resolveEffectiveTier(
  selectedConditionId: ConditionId,
  evaluation: DeviceEvaluation
): ConditionId {
  if (
    selectedConditionId === 'others-agent' ||
    evaluation.functionalStatus === 'other-agent-issue'
  ) {
    return 'others-agent';
  }

  const tierRank: Record<Exclude<ConditionId, 'others-agent'>, number> = {
    'zero-scratch': 0,
    'small-scratch': 150,
    'medium-scratch': 400,
    'parts-change-genuine': 500,
    'more-scratch-broken': 700,
    'hardware-unknown-parts': 1000,
  };

  let requiredDeduction = tierRank[selectedConditionId];

  // Battery Health rules from arsouq table:
  // Zero Scratch requires 90%+; 85-89% moves at least to Small Scratch (-150); <85% moves at least to Medium Scratch (-400)
  if (evaluation.batteryHealth === '85-89') {
    requiredDeduction = Math.max(requiredDeduction, 150);
  } else if (evaluation.batteryHealth === 'below-85') {
    requiredDeduction = Math.max(requiredDeduction, 400);
  }

  // Screen rules:
  if (evaluation.screenStatus === 'small-scratch') {
    requiredDeduction = Math.max(requiredDeduction, 150);
  } else if (evaluation.screenStatus === 'medium-deep-scratch') {
    requiredDeduction = Math.max(requiredDeduction, 400);
  } else if (evaluation.screenStatus === 'display-crack') {
    requiredDeduction = Math.max(requiredDeduction, 700);
  } else if (evaluation.screenStatus === 'display-not-working') {
    requiredDeduction = Math.max(requiredDeduction, 1000);
  }

  // Body & Parts rules:
  if (evaluation.bodyPartsStatus === 'small-body-scratch') {
    requiredDeduction = Math.max(requiredDeduction, 150);
  } else if (evaluation.bodyPartsStatus === 'body-dent-scratch') {
    requiredDeduction = Math.max(requiredDeduction, 400);
  } else if (evaluation.bodyPartsStatus === 'genuine-part-changed') {
    requiredDeduction = Math.max(requiredDeduction, 500);
  } else if (evaluation.bodyPartsStatus === 'back-glass-broken-dent') {
    requiredDeduction = Math.max(requiredDeduction, 700);
  } else if (evaluation.bodyPartsStatus === 'unknown-unofficial-part') {
    requiredDeduction = Math.max(requiredDeduction, 1000);
  }

  // Functional rules:
  if (evaluation.functionalStatus === 'mic-speaker-camera-dot') {
    requiredDeduction = Math.max(requiredDeduction, 700);
  } else if (evaluation.functionalStatus === 'faceid-hardware-issue') {
    requiredDeduction = Math.max(requiredDeduction, 1000);
  }

  const entry = (Object.entries(tierRank) as [Exclude<ConditionId, 'others-agent'>, number][]).find(
    ([, ded]) => ded === requiredDeduction
  );

  return entry ? entry[0] : 'zero-scratch';
}

export function calculateValuation(
  model: PhoneModel | null,
  storageCapacity: StorageCapacity | null,
  conditionId: ConditionId,
  evaluation: DeviceEvaluation
): ValuationBreakdown {
  if (!model) {
    return {
      currency: 'AED',
      isAgentQuote: true,
      appliedTierId: 'others-agent',
      appliedTierTitle: 'Others — Reply by Agent',
      maxPossibleAed: 0,
      storageBaseAed: 0,
      deductionAed: 0,
      finalEstimateAed: 0,
      priceLockDays: 7,
      lineItems: [],
    };
  }

  const storageOpt =
    model.storageOptions.find((s) => s.capacity === storageCapacity) ?? model.storageOptions[0];
  const storageBaseAed = model.basePriceAed + storageOpt.priceDeltaAed;
  const maxPossibleAed = getMaxModelPriceAed(model);

  const effectiveTierId = resolveEffectiveTier(conditionId, evaluation);
  const tierObj =
    CONDITION_TIERS.find((t) => t.id === effectiveTierId) ?? CONDITION_TIERS[0];

  if (effectiveTierId === 'others-agent' || tierObj.deductionAed === null) {
    return {
      currency: 'AED',
      isAgentQuote: true,
      appliedTierId: 'others-agent',
      appliedTierTitle: 'Others — Reply by Agent',
      maxPossibleAed,
      storageBaseAed,
      deductionAed: 0,
      finalEstimateAed: 0,
      priceLockDays: 7,
      lineItems: [
        {
          id: 'base',
          label: `${model.name} (${storageOpt.capacity})`,
          detail: 'Zero Scratch reference value',
          amountAed: storageBaseAed,
          kind: 'base',
        },
      ],
    };
  }

  const deductionAed = tierObj.deductionAed;
  const finalEstimateAed = Math.max(150, storageBaseAed - deductionAed);

  const lineItems: ValuationLineItem[] = [
    {
      id: 'base',
      label: `${model.name} (${storageOpt.capacity})`,
      detail: 'Zero Scratch (Flawless) base price',
      amountAed: storageBaseAed,
      kind: 'base',
    },
  ];

  if (deductionAed > 0) {
    lineItems.push({
      id: 'tier-deduction',
      label: tierObj.title,
      detail: tierObj.summary,
      amountAed: -deductionAed,
      kind: 'deduction',
    });
  }

  return {
    currency: 'AED',
    isAgentQuote: false,
    appliedTierId: effectiveTierId,
    appliedTierTitle: tierObj.title,
    maxPossibleAed,
    storageBaseAed,
    deductionAed,
    finalEstimateAed,
    priceLockDays: 7,
    lineItems,
  };
}
