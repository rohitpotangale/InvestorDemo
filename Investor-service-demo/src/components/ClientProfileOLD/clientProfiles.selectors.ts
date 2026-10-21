import type { ClientProfile, Entitlement, SecureView } from './clientProfiles.types';
export const isEntitled = (status: unknown) => String(status ?? '').trim().toLowerCase() === 'entitled';
export function entitledCodes(items: Entitlement[], clientId: string) {
  return new Set(items.filter(x => x.clientId === clientId && isEntitled(x.status)).map(x => x.viewCode));
}
export function countsByClient(items: Entitlement[]) {
  const sets: Record<string, Set<string>> = {};
  items.forEach(x => { if (isEntitled(x.status)) { (sets[x.clientId] ||= new Set()).add(x.viewCode); } });
  const out: Record<string, number> = {}; Object.keys(sets).forEach(k => out[k] = sets[k].size); return out;
}
export function filterClients(clients: ClientProfile[], query: string) {
  const q = query.trim().toLowerCase(); return clients.filter(c => !q || c.name.toLowerCase().includes(q) || c.segment.toLowerCase().includes(q));
}
export function filterCategory<T extends {categoryCode: string}>(items: T[], category: string) { return category === 'ALL' ? items : items.filter(x => x.categoryCode === category); }
export function filterViews(items: SecureView[], query: string) {
  const q = query.trim().toLowerCase(); return !q ? items : items.filter(v => v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || v.categoryCode.toLowerCase().includes(q));
}
