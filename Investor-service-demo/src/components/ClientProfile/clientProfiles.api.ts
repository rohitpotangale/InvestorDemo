
import { CLIENT_PROFILES_MOCK_RESPONSE } from './clientProfiles.mock';
import { extractApiRecords } from './clientProfiles.transform';
import type { ApiRecord } from './clientProfiles.types';

export const USE_MOCK_CLIENT_PROFILES = true;

export async function fetchClientProfiles(): Promise<ApiRecord[]> {
  const payload: unknown = CLIENT_PROFILES_MOCK_RESPONSE;

  console.log('[Mock] Complete response:', payload);

  const records = extractApiRecords(payload);

  console.log('[Mock] Extracted records:', records);
  console.log('[Mock] Record count:', records.length);

  if (records.length === 0) {
    throw new Error('No records extracted from mock response.');
  }

  return records;
}

export async function addEntitlement(_record: ApiRecord): Promise<void> {
  throw new Error('Add entitlement API is not configured yet.');
}

export async function getEntitlementStatus(
  _record: ApiRecord,
): Promise<'ENTITLED' | 'IN_PROGRESS' | 'FAILED'> {
  throw new Error('Entitlement status API is not configured yet.');
}
