/** Shared contracts for the Client Profiles / Secure View Entitlements UI. */
export type CategoryCode = 'ALL' | (string & {});
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | (string & {});
export type EntitlementStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'FAILED' | 'ENTITLED' | 'GRANTED' | (string & {});

/** Raw record returned by getClientProfilesPayload. */
export interface ApiRecord {
  VIEW_SCHEMA?: unknown;
  VIEW_NAME?: unknown;
  VIEW_TYPE?: unknown;
  VIEW_DEPLOYED?: unknown;
  VIEW_SHARED?: unknown;
  CREATED_ON?: unknown;
  /** Legacy field aliases are accepted while the service migration completes. */
  OBJECT_SCHEMA?: unknown;
  OBJECT_NAME?: unknown;
  [key: string]: unknown;
}

export interface ClientProfile {
  /** The API currently does not provide a separate client ID; schema is used as the scope ID. */
  id: string;
  name: string;
  code: string;
  segment: string;
  region: string;
  status: ClientStatus;
}

export interface SecureView {
  /** VIEW_NAME is the view identity, matching the previous OBJECT_NAME mapping. */
  code: string;
  name: string;
  categoryCode: CategoryCode;
  description: string;
  /** Schemas for which the API explicitly reports VIEW_DEPLOYED = No. */
  availableClientIds?: string[];
  /** Original records keyed by schema/client scope, used to construct the POST body. */
  originalRecordByClient?: Record<string, ApiRecord>;
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

export interface ClientProfilesDataModel {
  clients: ClientProfile[];
  masterViews: SecureView[];
  entitlements: ClientViewEntitlement[];
  categories: SecureViewCategory[];
  /** Explicitly not-entitled view codes per schema. */
  availableViewCodesByClient: Record<string, string[]>;
}
