export type CategoryCode = string;
export type StatusFilter = 'ALL' | 'ACTIVE' | 'IN_PROGRESS' | 'FAILED';
export type ViewSearchState = { available: string; entitled: string; catalog: string };
export interface ApiRecord {
  OBJECT_NAME?: string; OBJECT_SCHEMA?: string; OBJECT_DATABASE?: string;
  SHARE_NAME?: string; VIEW_TYPE?: string; STATUS?: string; DELETED_ON?: string | null;
  [key: string]: unknown;
}
export interface ClientProfile { id: string; name: string; status: 'ACTIVE'; segment: string; region: string }
export interface SecureView {
  code: string; name: string; description: string; categoryCode: string;
  originalRecords: ApiRecord[]; originalRecordByClient: Record<string, ApiRecord>;
}
export interface Entitlement { clientId: string; viewCode: string; status: string; originalRecord: ApiRecord }
export interface RequestEntry { status: 'IN_PROGRESS' | 'FAILED'; createdAt: number; error?: string }
export type RequestMap = Record<string, RequestEntry>;
