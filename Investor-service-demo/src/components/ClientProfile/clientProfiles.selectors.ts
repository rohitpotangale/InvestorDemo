import type {
  CategoryCode,
  ClientProfile,
  ClientViewEntitlement,
  SecureView,
} from './clientProfiles.types';

/** Build a set of known secure-view codes granted to one client. */
export const buildEntitledViewCodeSet = (
  entitlements: ClientViewEntitlement[],
  clientId: string,
  masterViewCodeSet: ReadonlySet<string>,
): Set<string> => {
  const entitledCodes = new Set<string>();
  if (!clientId) return entitledCodes;

  entitlements.forEach((entitlement) => {
    if (
      entitlement.clientId === clientId &&
      masterViewCodeSet.has(entitlement.viewCode) &&
      isActiveEntitlement(entitlement)
    ) {
      entitledCodes.add(entitlement.viewCode);
    }
  });
  return entitledCodes;
};

/** Keep one entitlement per client/view pair; the last entry wins. */
export const dedupeEntitlements = <T extends ClientViewEntitlement>(entitlements: T[]): T[] => {
  const byKey = new Map<string, T>();
  entitlements.forEach((entitlement) => {
    byKey.set(`${entitlement.clientId}\u0000${entitlement.viewCode}`, entitlement);
  });
  return Array.from(byKey.values());
};

export const filterByCategory = <T extends Pick<SecureView, 'categoryCode'>>(
  views: T[],
  category: CategoryCode,
): T[] => {
  if (!category || category === 'ALL') return views;
  return views.filter((view) => view.categoryCode === category);
};

export const filterClientsBySearch = <T extends ClientProfile>(
  clients: T[],
  search: string,
  entitledCountByClient: Readonly<Record<string, number>>,
): T[] => {
  const query = normalize(search);
  if (!query) return clients;
  return clients.filter((client) => {
    const count = entitledCountByClient[client.id] ?? 0;
    const searchable = [client.name, client.code, client.segment, client.region, client.status, String(count)]
      .map(normalize)
      .join(' ');
    return searchable.includes(query);
  });
};

export const filterViewsBySearch = <T extends SecureView>(views: T[], search: string): T[] => {
  const query = normalize(search);
  if (!query) return views;
  return views.filter((view) => {
    const searchable = [view.name, view.code, view.description, view.categoryCode].map(normalize).join(' ');
    return searchable.includes(query);
  });
};

export const getEntitledCountByClient = (
  entitlements: ClientViewEntitlement[],
  masterViewCodeSet: ReadonlySet<string>,
): Record<string, number> => {
  const seenPairs = new Set<string>();
  const counts: Record<string, number> = {};
  entitlements.forEach((entitlement) => {
    if (!masterViewCodeSet.has(entitlement.viewCode) || !isActiveEntitlement(entitlement)) return;
    const pair = `${entitlement.clientId}\u0000${entitlement.viewCode}`;
    if (seenPairs.has(pair)) return;
    seenPairs.add(pair);
    counts[entitlement.clientId] = (counts[entitlement.clientId] ?? 0) + 1;
  });
  return counts;
};

const isActiveEntitlement = (entitlement: ClientViewEntitlement): boolean => {
  const status = String(entitlement.status ?? 'ACTIVE').toUpperCase();
  return status === 'ACTIVE' || status === 'ENTITLED' || status === 'GRANTED';
};

const normalize = (value: unknown): string => String(value ?? '').trim().toLocaleLowerCase();
