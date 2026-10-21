import type {
  ApiRecord,
  CategoryCode,
  ClientProfilesDataModel,
  ClientProfile,
  ClientViewEntitlement,
  SecureView,
  SecureViewCategory,
} from './clientProfiles.types';

const text = (value: unknown): string => String(value ?? '').trim();
const firstText = (record: ApiRecord, ...keys: string[]): string => {
  for (const key of keys) {
    const value = text(record[key]);
    if (value) return value;
  }
  return '';
};

export const getApiViewName = (record: ApiRecord): string =>
  firstText(record, 'VIEW_NAME', 'view_name', 'OBJECT_NAME', 'object_name');

export const getApiViewSchema = (record: ApiRecord): string =>
  firstText(record, 'VIEW_SCHEMA', 'view_schema', 'OBJECT_SCHEMA', 'object_schema');

export const getApiViewType = (record: ApiRecord): string =>
  firstText(record, 'VIEW_TYPE', 'view_type') || 'OTHER';

export type DeployedState = 'YES' | 'NO' | 'UNKNOWN';
export const getDeployedState = (record: ApiRecord): DeployedState => {
  const raw = firstText(record, 'VIEW_DEPLOYED', 'view_deployed').toLowerCase();
  if (['yes', 'true', '1', 'deployed'].includes(raw)) return 'YES';
  if (['no', 'false', '0', 'not deployed'].includes(raw)) return 'NO';
  return 'UNKNOWN';
};

/**
 * Extract records from the array response shown by the API, or common API
 * response envelopes (data/results/records/payload/items). Legacy key aliases
 * remain supported for safe transition from the former response shape.
 */
export function extractApiRecords(payload: unknown): ApiRecord[] {
  const visited = new Set<unknown>();
  const preferredKeys = [
    'data', 'records', 'results', 'payload', 'items', 'views',
    'clientProfiles', 'client_profiles', 'result',
  ];

  const visit = (value: unknown, depth: number): ApiRecord[] => {
    if (depth > 8 || value == null || visited.has(value)) return [];
    if (typeof value === 'object') visited.add(value);

    if (Array.isArray(value)) {
      const candidates = value.filter(
        (item): item is ApiRecord =>
          Boolean(item) && typeof item === 'object' && !Array.isArray(item) &&
          Boolean(getApiViewName(item as ApiRecord)),
      );
      if (candidates.length > 0) return candidates;
      for (const item of value) {
        const nested = visit(item, depth + 1);
        if (nested.length) return nested;
      }
      return [];
    }

    if (typeof value !== 'object') return [];
    const record = value as Record<string, unknown>;
    if (Boolean(getApiViewName(record as ApiRecord))) return [record as ApiRecord];

    for (const key of preferredKeys) {
      if (key in record) {
        const nested = visit(record[key], depth + 1);
        if (nested.length) return nested;
      }
    }

    for (const nestedValue of Object.values(record)) {
      const nested = visit(nestedValue, depth + 1);
      if (nested.length) return nested;
    }
    return [];
  };

  return visit(payload, 0);
}

const describeRecord = (record: ApiRecord): string => {
  const created = firstText(record, 'CREATED_ON', 'created_on');
  const shared = firstText(record, 'VIEW_SHARED', 'view_shared');
  const parts: string[] = [];
  if (created) {
    const date = new Date(created);
    parts.push(
      `Created ${Number.isNaN(date.getTime())
        ? created
        : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    );
  }
  if (shared) parts.push(`Shared: ${shared}`);
  return parts.join(' · ') || 'Secure view';
};

export function transformRecords(records: ApiRecord[]): ClientProfilesDataModel {
  const clientsBySchema = new Map<string, ClientProfile>();
  const viewsByName = new Map<string, SecureView>();
  const entitlements: ClientViewEntitlement[] = [];
  const availableViewCodesByClient: Record<string, string[]> = {};
  const categoryCodes = new Set<string>();
  const entitlementKeys = new Set<string>();

  for (const record of records) {
    const schema = getApiViewSchema(record);
    const viewName = getApiViewName(record);
    if (!schema || !viewName) continue;

    if (!clientsBySchema.has(schema)) {
      clientsBySchema.set(schema, {
        id: schema,
        name: schema,
        code: schema,
        segment: 'Schema',
        region: 'API',
        status: 'ACTIVE',
      });
    }

    const categoryCode = getApiViewType(record).toUpperCase() as CategoryCode;
    categoryCodes.add(categoryCode);
    let view = viewsByName.get(viewName);
    if (!view) {
      view = {
        code: viewName,
        name: viewName,
        categoryCode,
        description: describeRecord(record),
        availableClientIds: [],
        originalRecordByClient: {},
      };
      viewsByName.set(viewName, view);
    } else if (view.categoryCode === 'OTHER' && categoryCode !== 'OTHER') {
      view.categoryCode = categoryCode;
    }
    view.originalRecordByClient![schema] = record;

    const deployed = getDeployedState(record);
    if (deployed === 'NO') {
      if (!view.availableClientIds!.includes(schema)) view.availableClientIds!.push(schema);
      const codes = availableViewCodesByClient[schema] ?? (availableViewCodesByClient[schema] = []);
      if (!codes.includes(viewName)) codes.push(viewName);
    } else if (deployed === 'YES') {
      const key = `${schema}\u0000${viewName}`;
      if (!entitlementKeys.has(key)) {
        entitlementKeys.add(key);
        const createdOn = firstText(record, 'CREATED_ON', 'created_on');
        entitlements.push({
          clientId: schema,
          viewCode: viewName,
          status: 'ACTIVE',
          ...(createdOn ? { grantedAt: createdOn } : {}),
        });
      }
    }
  }

  const categories: SecureViewCategory[] = [
    { code: 'ALL', label: 'All views' },
    ...Array.from(categoryCodes)
      .filter((code) => code !== 'ALL')
      .sort((left, right) => left.localeCompare(right))
      .map((code) => ({ code: code as CategoryCode, label: code })),
  ];

  return {
    clients: Array.from(clientsBySchema.values()),
    masterViews: Array.from(viewsByName.values()).sort((left, right) => left.name.localeCompare(right.name)),
    entitlements,
    categories,
    availableViewCodesByClient,
  };
}
