import { CONDITION_TIERS } from '../data/catalog';
import type {
  ConditionId,
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
 * Calculates the approximate B2B buyback estimate using arsouq fixed AED quality tiers:
 *  - Flawless (Zero Scratch):           -AED 0
 *  - Small Scratch:                     -AED 150
 *  - Medium Scratch:                    -AED 400
 *  - Parts Change (Genuine Part):       -AED 500
 *  - More Scratch / Dent / Broken:      -AED 700
 *  - Hardware Issue / Unknown Parts:    -AED 1,000
 *  - Others:                            Reply by agent
 */
export function calculateValuation(
  model: PhoneModel | null,
  storageCapacity: StorageCapacity | null,
  conditionId: ConditionId,
  quantity = 1
): ValuationBreakdown {
  const safeQty = Math.max(1, Math.floor(quantity || 1));

  if (!model) {
    return {
      currency: 'AED',
      isAgentQuote: true,
      appliedTierId: 'others-agent',
      appliedTierTitle: 'Others — Reply by Agent',
      maxPossibleAed: 0,
      storageBaseAed: 0,
      deductionAed: 0,
      unitEstimateAed: 0,
      quantity: safeQty,
      finalEstimateAed: 0,
      lineItems: [],
    };
  }

  const storageOpt =
    model.storageOptions.find((s) => s.capacity === storageCapacity) ?? model.storageOptions[0];
  const storageBaseAed = model.basePriceAed + storageOpt.priceDeltaAed;
  const maxPossibleAed = getMaxModelPriceAed(model);

  const tierObj =
    CONDITION_TIERS.find((t) => t.id === conditionId) ?? CONDITION_TIERS[0];

  if (conditionId === 'others-agent' || tierObj.deductionAed === null) {
    return {
      currency: 'AED',
      isAgentQuote: true,
      appliedTierId: 'others-agent',
      appliedTierTitle: 'Others — Reply by Agent',
      maxPossibleAed,
      storageBaseAed,
      deductionAed: 0,
      unitEstimateAed: 0,
      quantity: safeQty,
      finalEstimateAed: 0,
      lineItems: [
        {
          id: 'base',
          label: `${model.name} (${storageOpt.capacity})`,
          detail: 'Flawless reference unit value',
          amountAed: storageBaseAed,
          kind: 'base',
        },
      ],
    };
  }

  const deductionAed = tierObj.deductionAed;
  const unitEstimateAed = Math.max(150, storageBaseAed - deductionAed);
  const finalEstimateAed = unitEstimateAed * safeQty;

  const lineItems: ValuationLineItem[] = [
    {
      id: 'base',
      label: `${model.name} (${storageOpt.capacity})`,
      detail: 'Flawless (Zero Scratch) unit base price',
      amountAed: storageBaseAed,
      kind: 'base',
    },
  ];

  if (deductionAed > 0) {
    lineItems.push({
      id: 'tier-deduction',
      label: `${tierObj.title} adjustment`,
      detail: tierObj.summary,
      amountAed: -deductionAed,
      kind: 'deduction',
    });
  }

  return {
    currency: 'AED',
    isAgentQuote: false,
    appliedTierId: tierObj.id,
    appliedTierTitle: tierObj.title,
    maxPossibleAed,
    storageBaseAed,
    deductionAed,
    unitEstimateAed,
    quantity: safeQty,
    finalEstimateAed,
    lineItems,
  };
}
