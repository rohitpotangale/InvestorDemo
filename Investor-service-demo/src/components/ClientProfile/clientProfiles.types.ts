/** Shared TypeScript contracts for the Client Profiles / Secure View Entitlements UI. */
export type CategoryCode =
  | 'ALL'
  | 'ACCOUNT'
  | 'CSDR'
  | 'FUNDS'
  | 'INTRADAY'
  | 'MT564'
  | (string & {});

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | (string & {});
export type EntitlementStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'FAILED' | (string & {});

export interface ClientProfile {
  id: string;
  name: string;
  code: string;
  segment: string;
  region: string;
  status: ClientStatus;
}

export interface SecureView {
  code: string;
  name: string;
  categoryCode: CategoryCode;
  description: string;
}

export interface ClientViewEntitlement {
  clientId: string;
  viewCode: string;
  status: EntitlementStatus;
  grantedAt?: string;
  grantedBy?: string;
}

export interface ViewSearchState {
  entitled: string;
  catalog: string;
  available: string;
}

export interface SecureViewCategory {
  code: CategoryCode;
  label: string;
}

export interface ClientProfilesMockData {
  clients: ClientProfile[];
  masterViews: SecureView[];
  entitlements: ClientViewEntitlement[];
  categories: SecureViewCategory[];
}
