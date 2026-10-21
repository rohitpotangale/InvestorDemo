// import { getClientProfilesPayload } from '@services/pipelineConfigs.api';
import { extractApiRecords } from './clientProfiles.transform';
import type { ApiRecord } from './clientProfiles.types';

export async function fetchClientProfiles(): Promise<ApiRecord[]> {
  const payload: unknown = []//await getClientProfilesPayload();
  const records = extractApiRecords(payload);
  if (!records.length) throw new Error('No client profile records found in API response. Check the response envelope in extractApiRecords().');
  return records;
}

// The add/status endpoints were not supplied. Replace these implementations with the real API calls.
export async function addEntitlement(_record: ApiRecord): Promise<void> {
  throw new Error('Add entitlement API is not configured yet.');
}
export async function getEntitlementStatus(_record: ApiRecord): Promise<'ENTITLED' | 'IN_PROGRESS' | 'FAILED'> {
  throw new Error('Entitlement status API is not configured yet.');
}
