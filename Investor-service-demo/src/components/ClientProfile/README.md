# Client Profiles — API-aligned files

This package keeps the supplied `ClientProfiles.tsx` layout and CSS structure, and changes the data layer to match the current `getClientProfilesPayload()` response.

## Field mapping

- `OBJECT_NAME` -> `VIEW_NAME` (view name / identity)
- `OBJECT_SCHEMA` -> `VIEW_SCHEMA` (schema scope)
- `VIEW_TYPE` -> `VIEW_TYPE` (category, unchanged)
- `STATUS` -> `VIEW_DEPLOYED` (entitlement state)
- `CREATED_ON` and `VIEW_SHARED` are kept as metadata

Status rules:

- `VIEW_DEPLOYED: "No"` -> appears in **Available secure views** for that schema.
- `VIEW_DEPLOYED: "Yes"` -> appears in **Client entitlements** for that schema.
- Unknown or missing `VIEW_DEPLOYED` values are not treated as either available or entitled.

## Included files

- `ClientProfiles.tsx` — your supplied UI with the existing layout preserved; its data source is now the custom hook.
- `ClientProfiles.css` — the supplied styles plus minimal loading/error banner styles.
- `clientProfiles.types.ts` — common types and the API record contract.
- `clientProfiles.selectors.ts` — search, category, dedupe, and entitlement selectors.
- `clientProfiles.transform.ts` — response-envelope extraction and mapping.
- `clientProfiles.api.ts` — calls `getClientProfilesPayload()` and contains the requested Add POST-body builder.
- `clientProfiles.mock.ts` — local API-shaped sample response.
- `hooks/useClientProfiles.ts` — fetch, loading, refresh, error, and transformation state.

## Install / copy

Copy the included files into the folder that contains your current `ClientProfiles.tsx`. Keep `hooks/useClientProfiles.ts` in a `hooks` subfolder. The files retain your current imports for `@citi-icg-172888/icgds-react` and `@services/pipelineConfigs.api`.

## Mock mode

In `clientProfiles.api.ts`:

```ts
export const USE_MOCK_CLIENT_PROFILES = false;
```

Set it to `true` to use `CLIENT_PROFILES_MOCK_RESPONSE` instead of calling the API. The hook logs the raw response and extracted record count to the browser console.

## Scope / API contract note

The response shown in the request only contains view/schema fields; it does not include a separate client ID or client display name. To make the requirement “available to add for that schema” work, the UI sidebar scope is currently built from distinct `VIEW_SCHEMA` values. If the real endpoint later returns a separate client identifier/name, map that field in `transformRecords()` rather than assuming schema is a real client name.

The Add button still uses the supplied component's local demo timer, so it visually simulates an add operation. The request body builder is available in `clientProfiles.api.ts` and returns:

```json
{
  "view_name": "<VIEW_NAME>",
  "source_schema": null,
  "target_schema": "<VIEW_SCHEMA>"
}
```

The actual Add Entitlement endpoint and the status/polling response contract were not included in the supplied code/screenshots, so this package does not invent a URL or claim that the Add action calls the backend.
