import type { SellSubmissionRecord } from '../types/buyback';

const SUBMISSIONS_STORAGE_KEY = 'arsouq_submissions_v1';

export function saveSellSubmission(
  payload: Omit<SellSubmissionRecord, 'referenceCode' | 'createdAtIso' | 'status'>
): SellSubmissionRecord {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const record: SellSubmissionRecord = {
    ...payload,
    referenceCode: `ARS-DXB-${randomDigits}`,
    createdAtIso: new Date().toISOString(),
    status: payload.valuation.isAgentQuote ? 'agent_quote_pending' : 'pending_pickup',
  };

  try {
    const existingRaw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    const existing: SellSubmissionRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify([record, ...existing]));
  } catch {
    // Graceful fallback in private browsing
  }

  return record;
}

export function listSavedSubmissions(): SellSubmissionRecord[] {
  try {
    const existingRaw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    return existingRaw ? JSON.parse(existingRaw) : [];
  } catch {
    return [];
  }
}
