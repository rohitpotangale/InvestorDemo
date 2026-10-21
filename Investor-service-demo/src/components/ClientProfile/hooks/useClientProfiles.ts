import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchClientProfiles } from '../clientProfiles.api';
import { transformRecords } from '../clientProfiles.transform';
import type { ClientProfilesDataModel } from '../clientProfiles.types';

const EMPTY_MODEL: ClientProfilesDataModel = {
  clients: [],
  masterViews: [],
  entitlements: [],
  categories: [{ code: 'ALL', label: 'All views' }],
  availableViewCodesByClient: {},
};

export function useClientProfiles() {
  const [data, setData] = useState<ClientProfilesDataModel>(EMPTY_MODEL);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const dataRef = useRef<ClientProfilesDataModel>(EMPTY_MODEL);
  const requestInFlight = useRef(false);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const refresh = useCallback(async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    const hasExistingData = dataRef.current.masterViews.length > 0;
    if (hasExistingData) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const records = await fetchClientProfiles();
      const next = transformRecords(records);
      if (!next.masterViews.length || !next.clients.length) {
        throw new Error('The API returned records, but no valid VIEW_NAME / VIEW_SCHEMA pairs were found.');
      }
      if (mounted.current) {
        dataRef.current = next;
        setData(next);
      }
    } catch (cause) {
      if (mounted.current) {
        setError(cause instanceof Error ? cause.message : 'Unable to load secure views.');
      }
    } finally {
      requestInFlight.current = false;
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  return {
    ...data,
    loading,
    refreshing,
    error,
    refresh,
  };
}
