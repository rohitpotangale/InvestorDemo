import { getClientProfilesPayload } from '@services/pipelineConfigs.api';
import { CLIENT_PROFILES_MOCK_RESPONSE } from './clientProfiles.mock';
import { extractApiRecords } from './clientProfiles.transform';
import type { ApiRecord } from './clientProfiles.types';

/** Set true only when developing without a reachable API. */
export const USE_MOCK_CLIENT_PROFILES = false;

export async function fetchClientProfiles(): Promise<ApiRecord[]> {
  const payload: unknown = USE_MOCK_CLIENT_PROFILES
    ? CLIENT_PROFILES_MOCK_RESPONSE
    : await getClientProfilesPayload();

  console.debug('[ClientProfiles] Raw getClientProfilesPayload response:', payload);
  const records = extractApiRecords(payload);
  console.debug('[ClientProfiles] Extracted view records:', records.length);

  if (!records.length) {
    throw new Error(
      `No secure-view records found in the ${USE_MOCK_CLIENT_PROFILES ? 'mock' : 'API'} response. ` +
      'Expected records containing VIEW_NAME and VIEW_SCHEMA.',
    );
  }
  return records;
}

/** Exact POST body mapping agreed for the Add Entitlement request. */
export function buildAddEntitlementPayload(record: ApiRecord): {
  view_name: string;
  source_schema: null;
  target_schema: string;
} {
  const viewName = String(record.VIEW_NAME ?? record.view_name ?? record.OBJECT_NAME ?? '').trim();
  const targetSchema = String(record.VIEW_SCHEMA ?? record.view_schema ?? record.OBJECT_SCHEMA ?? '').trim();
  if (!viewName || !targetSchema) {
    throw new Error('Cannot build Add Entitlement payload: VIEW_NAME and VIEW_SCHEMA are required.');
  }
  return {
    view_name: viewName,
    source_schema: null,
    target_schema: targetSchema,
  };
}

/*
 * The component's Add button remains a local demo operation until the real
 * Add Entitlement POST endpoint and status-response contract are supplied.
 * Use buildAddEntitlementPayload(record) when wiring that endpoint.
 */
