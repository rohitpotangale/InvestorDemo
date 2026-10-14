import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ApiRecord,
  Entitlement,
  RequestMap,
  SecureView,
} from "../clientProfiles.types";
import {
  fetchClientProfiles,
  addEntitlement,
  getEntitlementStatus,
} from "../clientProfiles.api";
import { transformRecords } from "../clientProfiles.transform";

const key = (client: string, view: string) => `${client}::${view}`;
const POLL_MS = 2500,
  MAX_POLLS = 50;

export function useClientProfiles() {
  const [data, setData] = useState(() => ({
    clients: [] as any[],
    masterViews: [] as SecureView[],
    entitlements: [] as Entitlement[],
    categories: [{ code: "ALL", label: "All categories" }],
  }));
  const [requestStates, setRequestStates] = useState<RequestMap>({});
  const [loading, setLoading] = useState(true),
    [refreshing, setRefreshing] = useState(false),
    [error, setError] = useState<string | null>(null);
  const mounted = useRef(true),
    inFlight = useRef(new Set<string>()),
    timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const refresh = useCallback(async () => {
    if (data.clients.length) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const rows = await fetchClientProfiles();

// const rows = await fetchClientProfiles();
const transformed = transformRecords(rows);

console.log('[UI] Transformed data:', {
  clients: transformed.clients.length,
  secureViews: transformed.masterViews.length,
  entitlements: transformed.entitlements.length,
});

setData(transformed);


      if (mounted.current) setData(transformRecords(rows));
    } catch (e) {
      if (mounted.current)
        setError(
          e instanceof Error ? e.message : "Unable to load client profiles."
        );
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [data.clients.length]);
  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);
  const addOrRetry = useCallback(
    async (clientId: string, view: SecureView) => {
      const k = key(clientId, view.code);
      if (inFlight.current.has(k)) return;
      const record: ApiRecord | undefined =
        view.originalRecordByClient[clientId] ?? view.originalRecords[0];
      if (!record) {
        setRequestStates((p) => ({
          ...p,
          [k]: {
            status: "FAILED",
            createdAt: Date.now(),
            error: "No source API record found.",
          },
        }));
        return;
      }
      if (
        data.entitlements.some(
          (e) =>
            e.clientId === clientId &&
            e.viewCode === view.code &&
            String(e.status).toLowerCase() === "entitled"
        )
      )
        return;
      inFlight.current.add(k);
      setRequestStates((p) => ({
        ...p,
        [k]: { status: "IN_PROGRESS", createdAt: Date.now() },
      }));
      try {
        await addEntitlement(record);
        for (let i = 0; i < MAX_POLLS; i++) {
          const status = await getEntitlementStatus(record);
          if (status === "ENTITLED") {
            setRequestStates((p) => {
              const n = { ...p };
              delete n[k];
              return n;
            });
            await refresh();
            return;
          }
          if (status === "FAILED")
            throw new Error("Backend reported that the entitlement failed.");
          await new Promise<void>((resolve) => {
            timers.current[k] = setTimeout(resolve, POLL_MS);
          });
          if (!mounted.current) return;
        }
        throw new Error("Status check timed out. Retry to check again.");
      } catch (e) {
        if (mounted.current)
          setRequestStates((p) => ({
            ...p,
            [k]: {
              status: "FAILED",
              createdAt: Date.now(),
              error: e instanceof Error ? e.message : "Request failed.",
            },
          }));
      } finally {
        inFlight.current.delete(k);
        delete timers.current[k];
      }
    },
    [data.entitlements, refresh]
  );
  return useMemo(
    () => ({
      ...data,
      requestStates,
      loading,
      refreshing,
      error,
      refresh,
      addSecureView: addOrRetry,
      retrySecureView: addOrRetry,
    }),
    [data, requestStates, loading, refreshing, error, refresh, addOrRetry]
  );
}
