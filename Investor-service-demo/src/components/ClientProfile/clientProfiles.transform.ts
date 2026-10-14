import type { ApiRecord, ClientProfile, Entitlement, SecureView } from './clientProfiles.types';

const str = (v: unknown) => v == null ? '' : String(v).trim();

export function extractApiRecords(payload: unknown): ApiRecord[] {
  if (Array.isArray(payload)) return payload as ApiRecord[];
  if (!payload || typeof payload !== 'object') return [];
  const p = payload as Record<string, unknown>;
  const data = p.data as Record<string, unknown> | undefined;
  const candidates = [p.data, p.records, p.items, p.result, p.results, data?.records, data?.items, data?.result];
  for (const c of candidates) if (Array.isArray(c)) return c as ApiRecord[];
  for (const c of Object.values(p)) {
    if (Array.isArray(c) && c.length && typeof c[0] === 'object' && c[0] && 'OBJECT_NAME' in c[0] && 'OBJECT_SCHEMA' in c[0]) return c as ApiRecord[];
  }
  return [];
}

export function transformRecords(records: ApiRecord[]) {
  const clients = new Map<string, ClientProfile>();
  const views = new Map<string, SecureView>();
  const entitlements: Entitlement[] = [];
  records.forEach((r) => {
    const client = str(r.OBJECT_SCHEMA), name = str(r.OBJECT_NAME);
    if (!client || !name) return;
    if (!clients.has(client)) clients.set(client, {
      id: client, name: client, status: 'ACTIVE',
      segment: str(r.SHARE_NAME) || 'Snowflake client',
      region: str(r.OBJECT_DATABASE) || 'Snowflake',
    });
    let v = views.get(name);
    if (!v) {
      v = { code: name, name, description: str(r.OBJECT_DATABASE) ? `Database: ${str(r.OBJECT_DATABASE)}` : 'Snowflake secure view',
        categoryCode: str(r.VIEW_TYPE) || 'Other', originalRecords: [], originalRecordByClient: {} };
      views.set(name, v);
    }
    v.originalRecords.push(r);
    if (!v.originalRecordByClient[client]) v.originalRecordByClient[client] = r;
    entitlements.push({ clientId: client, viewCode: name, status: str(r.STATUS), originalRecord: r });
  });
  const categories = [{ code: 'ALL', label: 'All categories' }, ...Array.from(new Set([...views.values()].map(v => v.categoryCode))).sort().map(code => ({ code, label: code }))];
  return { clients: [...clients.values()].sort((a,b) => a.name.localeCompare(b.name)), masterViews: [...views.values()].sort((a,b) => a.name.localeCompare(b.name)), entitlements, categories };
}
