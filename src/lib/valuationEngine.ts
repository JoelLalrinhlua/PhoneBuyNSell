import {
  ACCESSORY_BONUSES,
  CONDITION_TIERS,
  KNOWN_ISSUES_CATALOG,
} from '../data/catalog';
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

export function calculateValuation(
  model: PhoneModel,
  storageCapacity: StorageCapacity,
  conditionId: ConditionId,
  evaluation: DeviceEvaluation
): ValuationBreakdown {
  const storageOpt =
    model.storageOptions.find((s) => s.capacity === storageCapacity) ?? model.storageOptions[0];
  const conditionTier =
    CONDITION_TIERS.find((c) => c.id === conditionId) ?? CONDITION_TIERS[0];

  const storageBaseAed = model.basePriceAed + storageOpt.priceDeltaAed;
  const maxPossibleAed = getMaxModelPriceAed(model);

  const lineItems: ValuationLineItem[] = [
    {
      id: 'base',
      label: `${model.name} (${storageOpt.capacity})`,
      detail: 'Base UAE market buyback valuation',
      amountAed: storageBaseAed,
      kind: 'base',
    },
  ];

  const rawConditionValue = Math.round((storageBaseAed * conditionTier.multiplier) / 10) * 10;
  const conditionDeduction = rawConditionValue - storageBaseAed;

  if (conditionDeduction < 0) {
    lineItems.push({
      id: 'condition',
      label: `Condition Grade: ${conditionTier.title}`,
      detail: conditionTier.shortLabel,
      amountAed: conditionDeduction,
      kind: 'deduction',
    });
  }

  let diagnosticsDeltaAed = 0;

  // Battery Health modifier
  if (evaluation.batteryHealth === '80-89') {
    const ded = -90;
    diagnosticsDeltaAed += ded;
    lineItems.push({
      id: 'battery',
      label: 'Battery Health (80% – 89%)',
      amountAed: ded,
      kind: 'deduction',
    });
  } else if (evaluation.batteryHealth === 'below-80') {
    const ded = -210;
    diagnosticsDeltaAed += ded;
    lineItems.push({
      id: 'battery',
      label: 'Battery Service Required (<80%)',
      amountAed: ded,
      kind: 'deduction',
    });
  }

  // Screen evaluation modifier (beyond base condition if degraded)
  if (evaluation.screenStatus === 'visible-wear' && conditionId !== 'fair' && conditionId !== 'damaged') {
    const ded = -160;
    diagnosticsDeltaAed += ded;
    lineItems.push({
      id: 'screen',
      label: 'Visible Display Surface Wear',
      amountAed: ded,
      kind: 'deduction',
    });
  } else if (evaluation.screenStatus === 'cracked' && conditionId !== 'damaged') {
    const ded = -480;
    diagnosticsDeltaAed += ded;
    lineItems.push({
      id: 'screen',
      label: 'Display Glass / OLED Replacement Adjustment',
      amountAed: ded,
      kind: 'deduction',
    });
  }

  // Body evaluation modifier
  if (evaluation.bodyStatus === 'dents-cracks' && conditionId !== 'damaged') {
    const ded = -240;
    diagnosticsDeltaAed += ded;
    lineItems.push({
      id: 'body',
      label: 'Enclosure Dent / Rear Glass Adjustment',
      amountAed: ded,
      kind: 'deduction',
    });
  }

  // Core functionality modifier
  if (evaluation.functionalStatus === 'minor-issue') {
    const ded = -190;
    diagnosticsDeltaAed += ded;
    lineItems.push({
      id: 'functional',
      label: 'Hardware Diagnostic Adjustment',
      amountAed: ded,
      kind: 'deduction',
    });
  }

  // Specific Known Issues
  for (const issueId of evaluation.knownIssues) {
    const found = KNOWN_ISSUES_CATALOG.find((i) => i.id === issueId);
    if (found) {
      diagnosticsDeltaAed -= found.deductionAed;
      lineItems.push({
        id: `issue-${found.id}`,
        label: found.label,
        amountAed: -found.deductionAed,
        kind: 'deduction',
      });
    }
  }

  // Included Accessories / Warranty Bonuses
  let accessoriesBonusAed = 0;
  for (const bonusId of evaluation.accessories) {
    const found = ACCESSORY_BONUSES.find((b) => b.id === bonusId);
    if (found) {
      accessoriesBonusAed += found.bonusAed;
      lineItems.push({
        id: `bonus-${found.id}`,
        label: found.label,
        amountAed: found.bonusAed,
        kind: 'addition',
      });
    }
  }

  const minimumFloorAed = Math.max(180, Math.round((storageBaseAed * 0.18) / 10) * 10);
  const rawFinal = rawConditionValue + diagnosticsDeltaAed + accessoriesBonusAed;
  const finalEstimateAed = Math.max(minimumFloorAed, Math.round(rawFinal / 10) * 10);

  return {
    currency: 'AED',
    maxPossibleAed,
    storageBaseAed,
    conditionAdjustedAed: rawConditionValue,
    diagnosticsDeltaAed,
    accessoriesBonusAed,
    finalEstimateAed,
    priceLockDays: 7,
    lineItems,
  };
}
