# Client Profiles API implementation

Replace the component and add the files in this package alongside your existing `ClientProfiles.css`. The component uses your existing `getClientProfilesPayload()` API function.

- `OBJECT_SCHEMA` is the client identity.
- `OBJECT_NAME` is the globally unique secure-view identity.
- Only `STATUS === 'Entitled'` counts as active; `DELETED_ON` is ignored.
- Original API records, including `SHARE_NAME` and `OBJECT_DATABASE`, are retained for later grant requests.
- Filtering runs over the full in-memory list before virtualization.
- VirtualList initially uses a 10-row viewport and renders visible rows plus overscan.
- Add/status endpoints were not supplied. The placeholder functions throw explicitly rather than falsely showing success. Replace `addEntitlement` and `getEntitlementStatus` in `clientProfiles.api.ts` when real API contracts are available.
- `extractApiRecords` supports direct arrays and common response wrappers; adjust it if your response has a different envelope.
- `ClientProfiles.performance.css` should be imported after your existing CSS.
