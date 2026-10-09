import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CLIENT_PROFILES_MOCK_DATA } from './clientProfiles.data';
import type {
  CategoryCode,
  ClientViewEntitlement,
  SecureView,
  ViewSearchState,
} from './clientProfiles.types';
import {
  buildEntitledViewCodeSet,
  dedupeEntitlements,
  filterByCategory,
  filterClientsBySearch,
  filterViewsBySearch,
  getEntitledCountByClient,
} from './clientProfiles.selectors';
import './ClientProfiles.css';

type RequestStatus = 'IN_PROGRESS' | 'FAILED';
type StatusFilter = 'ALL' | 'ACTIVE' | RequestStatus;
type RequestState = Record<string, RequestStatus>;
type IconName = 'search' | 'database' | 'plus' | 'check' | 'shield' | 'close' | 'trash' | 'refresh' | 'info' | 'chevron' | 'building' | 'filter' | 'arrow';

const DEFAULT_VIEW_SEARCH: ViewSearchState = { entitled: '', catalog: '', available: '' };
const nowIso = (): string => new Date().toISOString();
const entitlementKey = (clientId: string, viewCode: string): string => `${clientId}:${viewCode}`;

function UiIcon({ name, size = 16 }: { name: IconName; size?: number }) {
  let artwork: ReactNode;
  switch (name) {
    case 'search':
      artwork = <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.5 15.5 4.2 4.2" /></>;
      break;
    case 'database':
      artwork = <><ellipse cx="12" cy="5" rx="7.5" ry="3" /><path d="M4.5 5v7c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V5" /><path d="M4.5 12v7c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-7" /></>;
      break;
    case 'plus':
      artwork = <path d="M12 5v14M5 12h14" />;
      break;
    case 'check':
      artwork = <path d="m5 12 4.2 4.2L19 6.5" />;
      break;
    case 'shield':
      artwork = <><path d="M12 3 19 6v5c0 4.7-3 8-7 10-4-2-7-5.3-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>;
      break;
    case 'close':
      artwork = <path d="m6 6 12 12M18 6 6 18" />;
      break;
    case 'trash':
      artwork = <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 10v7M14 10v7" /></>;
      break;
    case 'refresh':
      artwork = <><path d="M20 7v5h-5" /><path d="M19 12a7 7 0 0 0-12-4L4 11M4 17v-5h5" /><path d="M5 12a7 7 0 0 0 12 4l3-3" /></>;
      break;
    case 'info':
      artwork = <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>;
      break;
    case 'chevron':
      artwork = <path d="m9 18 6-6-6-6" />;
      break;
    case 'building':
      artwork = <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M10 21v-5h4v5" /></>;
      break;
    case 'filter':
      artwork = <><path d="M4 5h16l-6.5 7.2V19l-3 1v-7.8L4 5Z" /></>;
      break;
    case 'arrow':
      artwork = <><path d="M5 12h13M13 6l6 6-6 6" /></>;
      break;
    default:
      artwork = null;
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cp-icon"
    >
      {artwork}
    </svg>
  );
}

const isActiveEntitlement = (entitlement: ClientViewEntitlement): boolean => {
  const status = String(entitlement.status ?? 'ACTIVE').toUpperCase();
  return status === 'ACTIVE' || status === 'ENTITLED' || status === 'GRANTED';
};

const uniqueCodes = (codes: string[]): string[] =>
  codes.filter((code, index, source) => source.indexOf(code) === index);

const ClientProfiles = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    CLIENT_PROFILES_MOCK_DATA.clients[0]?.id ?? '',
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryCode>('ALL');
  const [catalogCategory, setCatalogCategory] = useState<CategoryCode>('ALL');
  const [clientSearch, setClientSearch] = useState('');
  const [viewSearch, setViewSearch] = useState<ViewSearchState>(DEFAULT_VIEW_SEARCH);
  const [entitledStatus, setEntitledStatus] = useState<StatusFilter>('ALL');
  const [entitlements, setEntitlements] = useState<ClientViewEntitlement[]>(
    CLIENT_PROFILES_MOCK_DATA.entitlements,
  );
  const [selectedViewCodes, setSelectedViewCodes] = useState<string[]>([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [requestStates, setRequestStates] = useState<RequestState>(() => {
    const hostplus = CLIENT_PROFILES_MOCK_DATA.clients.find((client) => client.id === 'hostplus');
    const failedView = CLIENT_PROFILES_MOCK_DATA.masterViews.find(
      (view) => view.code === 'CSDR_PENALTY_FAIL_STATUS_LR_SV',
    );
    const alreadyActive = Boolean(
      hostplus && failedView && CLIENT_PROFILES_MOCK_DATA.entitlements.some(
        (item) => item.clientId === hostplus.id && item.viewCode === failedView.code && isActiveEntitlement(item),
      ),
    );
    return hostplus && failedView && !alreadyActive
      ? { [entitlementKey(hostplus.id, failedView.code)]: 'FAILED' }
      : {};
  });
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const masterViews: SecureView[] = CLIENT_PROFILES_MOCK_DATA.masterViews;
  const masterViewCodeSet = useMemo(
    () => new Set<string>(masterViews.map((view) => view.code)),
    [masterViews],
  );
  const entitledCountByClient = useMemo(
    () => getEntitledCountByClient(entitlements, masterViewCodeSet),
    [entitlements, masterViewCodeSet],
  );
  const filteredClients = useMemo(
    () => filterClientsBySearch(CLIENT_PROFILES_MOCK_DATA.clients, clientSearch, entitledCountByClient),
    [clientSearch, entitledCountByClient],
  );
  const selectedClient = useMemo(
    () => CLIENT_PROFILES_MOCK_DATA.clients.find((client) => client.id === selectedClientId)
      ?? filteredClients[0]
      ?? CLIENT_PROFILES_MOCK_DATA.clients[0],
    [filteredClients, selectedClientId],
  );
  const clientId = selectedClient?.id ?? '';

  const activeViewCodeSet = useMemo(
    () => buildEntitledViewCodeSet(entitlements, clientId, masterViewCodeSet),
    [entitlements, clientId, masterViewCodeSet],
  );
  const clientRequestStates = useMemo(() => {
    const scoped: RequestState = {};
    Object.keys(requestStates).forEach((key) => {
      if (key.indexOf(`${clientId}:`) === 0) {
        scoped[key.slice(clientId.length + 1)] = requestStates[key];
      }
    });
    return scoped;
  }, [clientId, requestStates]);

  const activeViews = useMemo(
    () => masterViews.filter((view) => activeViewCodeSet.has(view.code)),
    [masterViews, activeViewCodeSet],
  );
  const inProgressCount = Object.keys(clientRequestStates).filter((code) => clientRequestStates[code] === 'IN_PROGRESS').length;
  const failedCount = Object.keys(clientRequestStates).filter((code) => clientRequestStates[code] === 'FAILED').length;
  const availableViews = useMemo(
    () => masterViews.filter((view) => !activeViewCodeSet.has(view.code) && !clientRequestStates[view.code]),
    [masterViews, activeViewCodeSet, clientRequestStates],
  );
  const coveragePercent = masterViews.length
    ? Math.round((activeViews.length / masterViews.length) * 1000) / 10
    : 0;

  const filteredAvailableViews = useMemo(() => {
    const categoryScoped = filterByCategory<SecureView>(availableViews, selectedCategory);
    return filterViewsBySearch(categoryScoped, viewSearch.available);
  }, [availableViews, selectedCategory, viewSearch.available]);

  const filteredEntitledViews = useMemo(() => {
    const relevantViews = masterViews.filter(
      (view) => activeViewCodeSet.has(view.code) || Boolean(clientRequestStates[view.code]),
    );
    const categoryScoped = filterByCategory<SecureView>(relevantViews, selectedCategory);
    return filterViewsBySearch(categoryScoped, viewSearch.entitled)
      .filter((view) => {
        if (entitledStatus === 'ALL') return true;
        if (entitledStatus === 'ACTIVE') return activeViewCodeSet.has(view.code);
        return clientRequestStates[view.code] === entitledStatus;
      })
      .sort((left, right) => {
        const rank = (view: SecureView): number => {
          if (clientRequestStates[view.code] === 'IN_PROGRESS') return 0;
          if (clientRequestStates[view.code] === 'FAILED') return 1;
          return 2;
        };
        return rank(left) - rank(right) || left.name.localeCompare(right.name);
      });
  }, [masterViews, activeViewCodeSet, clientRequestStates, selectedCategory, viewSearch.entitled, entitledStatus]);

  const filteredCatalogViews = useMemo(() => {
    const categoryScoped = filterByCategory<SecureView>(masterViews, catalogCategory);
    return filterViewsBySearch(categoryScoped, viewSearch.catalog);
  }, [masterViews, catalogCategory, viewSearch.catalog]);

  useEffect(() => {
    setSelectedViewCodes([]);
  }, [clientId, selectedCategory, viewSearch.available]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCatalogOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => () => {
    Object.keys(timersRef.current).forEach((key) => clearTimeout(timersRef.current[key]));
  }, []);

  const updateViewSearch = (key: keyof ViewSearchState, value: string) => {
    setViewSearch((previous) => ({ ...previous, [key]: value }));
  };

  const startMockGrant = (clientForRequest: string, viewsToGrant: SecureView[]) => {
    const uniqueViews = viewsToGrant.filter(
      (view, index, source) => source.findIndex((candidate) => candidate.code === view.code) === index,
    );
    const requestable = uniqueViews.filter((view) => {
      const key = entitlementKey(clientForRequest, view.code);
      const alreadyActive = entitlements.some(
        (item) => item.clientId === clientForRequest && item.viewCode === view.code && isActiveEntitlement(item),
      );
      return !alreadyActive && requestStates[key] !== 'IN_PROGRESS';
    });

    if (!clientForRequest || requestable.length === 0) return;

    setRequestStates((previous) => {
      const next = { ...previous };
      requestable.forEach((view) => {
        next[entitlementKey(clientForRequest, view.code)] = 'IN_PROGRESS';
      });
      return next;
    });
    setSelectedViewCodes([]);

    requestable.forEach((view) => {
      const key = entitlementKey(clientForRequest, view.code);
      if (timersRef.current[key]) clearTimeout(timersRef.current[key]);
      // Demo only: replace the timer with the real entitlement API response.
      timersRef.current[key] = setTimeout(() => {
        setEntitlements((previous) => dedupeEntitlements([
          ...previous,
          {
            clientId: clientForRequest,
            viewCode: view.code,
            status: 'ACTIVE',
            grantedAt: nowIso(),
            grantedBy: 'demo.operator',
          },
        ]));
        setRequestStates((previous) => {
          const next = { ...previous };
          delete next[key];
          return next;
        });
        delete timersRef.current[key];
      }, 6500);
    });
  };

  const cancelRequest = (viewCode: string) => {
    const key = entitlementKey(clientId, viewCode);
    if (timersRef.current[key]) {
      clearTimeout(timersRef.current[key]);
      delete timersRef.current[key];
    }
    setRequestStates((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const retryRequest = (viewCode: string) => {
    const view = masterViews.find((candidate) => candidate.code === viewCode);
    if (view) startMockGrant(clientId, [view]);
  };

  const revokeView = (viewCode: string) => {
    const view = masterViews.find((candidate) => candidate.code === viewCode);
    const confirmed = window.confirm(`Revoke ${view?.name ?? viewCode} from ${selectedClient?.name ?? 'this client'}?`);
    if (!confirmed) return;
    setEntitlements((previous) => previous.filter(
      (item) => !(item.clientId === clientId && item.viewCode === viewCode),
    ));
  };

  const toggleViewSelection = (viewCode: string) => {
    setSelectedViewCodes((previous) => previous.indexOf(viewCode) !== -1
      ? previous.filter((code) => code !== viewCode)
      : previous.concat(viewCode));
  };

  const visibleAvailableCodes = filteredAvailableViews.map((view) => view.code);
  const allVisibleSelected = visibleAvailableCodes.length > 0
    && visibleAvailableCodes.every((code) => selectedViewCodes.indexOf(code) !== -1);
  const toggleVisibleSelection = () => setSelectedViewCodes((previous) => {
    if (allVisibleSelected) {
      return previous.filter((code) => visibleAvailableCodes.indexOf(code) === -1);
    }
    return uniqueCodes(previous.concat(visibleAvailableCodes));
  });

  const renderCategoryBadge = (categoryCode: string) => (
    <span className={`cp-category-badge cp-category-${categoryCode.toLowerCase()}`}>{categoryCode}</span>
  );

  const renderStatus = (status: 'ACTIVE' | RequestStatus) => {
    const labels: Record<'ACTIVE' | RequestStatus, string> = {
      ACTIVE: 'Active',
      IN_PROGRESS: 'Adding access',
      FAILED: 'Failed',
    };
    return (
      <span className={`cp-status cp-status-${status.toLowerCase().replace('_', '-')}`}>
        {status === 'ACTIVE' && <UiIcon name="check" size={12} />}
        {status === 'IN_PROGRESS' && <span className="cp-spinner" aria-hidden="true" />}
        {status === 'FAILED' && <UiIcon name="info" size={12} />}
        {labels[status]}
      </span>
    );
  };

  const getViewStatus = (viewCode: string): 'ACTIVE' | RequestStatus =>
    activeViewCodeSet.has(viewCode) ? 'ACTIVE' : clientRequestStates[viewCode] ?? 'FAILED';

  const getStatusCopy = (viewCode: string) => {
    const status = getViewStatus(viewCode);
    if (status === 'IN_PROGRESS') return 'Usually takes about 2 minutes';
    if (status === 'FAILED') return 'Request needs attention';
    const entitlement = entitlements.find((item) => item.clientId === clientId && item.viewCode === viewCode);
    const date = entitlement?.grantedAt ? new Date(entitlement.grantedAt) : null;
    return date && !Number.isNaN(date.getTime())
      ? `Entitled ${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
      : 'Access is active';
  };

  return (
    <div className="client-profiles-page cp-page">
      <div className="client-profiles-layout cp-layout">
        <aside className="client-list-panel cp-client-panel">
          <div className="cp-sidebar-heading">
            <div>
              <span className="cp-eyebrow">WORKSPACE</span>
              <h2>Client profiles</h2>
              <p>Select a client to manage access</p>
            </div>
            <span className="cp-client-count">{CLIENT_PROFILES_MOCK_DATA.clients.length}</span>
          </div>

          <label className="cp-search-box cp-client-search">
            <UiIcon name="search" size={16} />
            <input
              type="search"
              value={clientSearch}
              onChange={(event) => setClientSearch(event.target.value)}
              placeholder="Search clients…"
              aria-label="Search client profiles"
            />
            {clientSearch && <button type="button" aria-label="Clear client search" onClick={() => setClientSearch('')}><UiIcon name="close" size={13} /></button>}
          </label>

          <div className="cp-client-list-label"><span>CLIENTS</span><span>{filteredClients.length} shown</span></div>
          <ul className="client-list cp-client-list" aria-label="Client profiles">
            {filteredClients.map((client) => {
              const isSelected = client.id === clientId;
              const activeCount = entitledCountByClient[client.id] ?? 0;
              const percentage = masterViews.length ? Math.round((activeCount / masterViews.length) * 1000) / 10 : 0;
              const processingCount = Object.keys(requestStates).filter(
                (key) => key.indexOf(`${client.id}:`) === 0 && requestStates[key] === 'IN_PROGRESS',
              ).length;
              return (
                <li key={client.id}>
                  <button
                    type="button"
                    className={`client-card cp-client-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedClientId(client.id)}
                    aria-pressed={isSelected}
                  >
                    <span className={`cp-client-avatar ${isSelected ? 'is-selected' : ''}`}>{client.name.charAt(0)}</span>
                    <span className="cp-client-card-main">
                      <span className="cp-client-name-line">
                        <strong title={client.name}>{client.name}</strong>
                        <span className={`status-pill ${client.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                          {client.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                      </span>
                      <small>{client.segment}<span className="cp-meta-separator">·</span>{client.region}</small>
                      <span className="cp-client-progress-row">
                        <span className="cp-client-progress-track"><span style={{ width: `${percentage}%` }} /></span>
                        <strong>{percentage}%</strong>
                      </span>
                      {processingCount > 0 && <span className="cp-client-pending-note">{processingCount} request{processingCount === 1 ? '' : 's'} processing</span>}
                    </span>
                    {isSelected && <span className="cp-selected-mark"><UiIcon name="check" size={13} /></span>}
                  </button>
                </li>
              );
            })}
            {filteredClients.length === 0 && <li className="cp-empty-sidebar">No clients match your search.</li>}
          </ul>
          <div className="cp-sidebar-footnote"><span className="cp-footnote-dot" /> Secure view access workspace</div>
        </aside>

        <main className="workspace-panel cp-workspace">
          <header className="cp-workspace-heading">
            <div className="cp-heading-copy">
              {/* <span className="cp-eyebrow">ACCESS MANAGEMENT</span>
              <h1>Secure view access</h1>
              <p>Find the right views, grant access, and track the result.</p> */}
              {selectedClient && <div className="cp-selected-client-line"><span className="cp-client-avatar cp-heading-avatar">{selectedClient.name.charAt(0)}</span><span><strong>{selectedClient.name}</strong><small>{selectedClient.code} <span>·</span> {selectedClient.region}</small></span><span className={`status-pill ${selectedClient.status === 'ACTIVE' ? 'active' : 'inactive'}`}>{selectedClient.status === 'ACTIVE' ? 'Active client' : 'Inactive client'}</span></div>}
            </div>
            <div className="cp-workspace-heading-actions">
              <div className="cp-coverage-mini" aria-label={`${coveragePercent}% view coverage`}>
                <span className="cp-coverage-ring" style={{ background: `conic-gradient(#4481e4 ${coveragePercent}%, #e8eef7 0)` }}><span>{coveragePercent}%</span></span>
                <span><strong>{activeViews.length} of {masterViews.length}</strong><small>views active</small></span>
              </div>
              <button type="button" className="cp-catalog-trigger" onClick={() => setCatalogOpen(true)}>
                <span className="cp-catalog-trigger-icon"><UiIcon name="database" size={18} /></span>
                <span><strong>Global catalog</strong><small>{masterViews.length} views · Read-only</small></span>
                <UiIcon name="chevron" size={15} />
              </button>
            </div>
          </header>

          <div className="cp-category-section">
            <div className="cp-section-kicker"><span>VIEW CATEGORIES</span><span><UiIcon name="filter" size={13} /> Filter available and entitled views</span></div>
            <div className="cp-category-bar" aria-label="Filter by secure view category">
              {CLIENT_PROFILES_MOCK_DATA.categories.map((category) => {
                const count = category.code === 'ALL' ? masterViews.length : masterViews.filter((view) => view.categoryCode === category.code).length;
                return (
                  <button
                    key={category.code}
                    type="button"
                    className={`category-pill cp-category-pill ${selectedCategory === category.code ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.code)}
                    aria-pressed={selectedCategory === category.code}
                  >
                    <span>{category.label}</span><small>{count}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <section className="workspace-columns cp-columns" aria-label="Secure view entitlement panels">
            <article className="views-column cp-views-panel cp-available-panel">
              <div className="cp-panel-heading">
                <span className="cp-panel-heading-icon cp-icon-available"><UiIcon name="plus" size={19} /></span>
                <div className="cp-panel-heading-copy"><h2>Available secure views</h2><p>Views not yet granted to this client</p></div>
                <span className="count-pill cp-count-pill">{filteredAvailableViews.length}</span>
              </div>

              <label className="cp-search-box cp-view-search">
                <UiIcon name="search" size={16} />
                <input value={viewSearch.available} onChange={(event) => updateViewSearch('available', event.target.value)} placeholder="Search name, code or description…" aria-label="Search available secure views" />
                {viewSearch.available && <button type="button" aria-label="Clear available search" onClick={() => updateViewSearch('available', '')}><UiIcon name="close" size={13} /></button>}
              </label>

              <div className="cp-panel-context-row">
                <span>{availableViews.length} views available for this client</span>
                {/* <label className="cp-select-visible"><input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleSelection} /><span>Select visible</span></label> */}
              </div>

              <ul className="views-list cp-view-list" aria-label="Available secure views">
                {filteredAvailableViews.map((view) => {
                  const selected = selectedViewCodes.indexOf(view.code) !== -1;
                  return (
                    <li key={view.code} className={`view-item cp-view-card ${selected ? 'is-selected' : ''}`}>
                      <label className="cp-row-checkbox" aria-label={`Select ${view.name}`}><input type="checkbox" checked={selected} onChange={() => toggleViewSelection(view.code)} /><span /></label>
                      <span className={`cp-view-icon cp-view-icon-${view.categoryCode.toLowerCase()}`}><UiIcon name="database" size={16} /></span>
                      <span className="cp-view-copy"><strong title={view.name}>{view.name}</strong><small title={view.description}>{view.description}</small></span>
                      {renderCategoryBadge(view.categoryCode)}
                      <button type="button" className="cp-add-button" onClick={() => startMockGrant(clientId, [view])}><UiIcon name="plus" size={14} /><span>Add</span></button>
                    </li>
                  );
                })}
                {filteredAvailableViews.length === 0 && <li className="empty-state cp-empty-state"><span className="cp-empty-icon"><UiIcon name="check" size={20} /></span><strong>No available views found</strong><p>Try another category or search term.</p></li>}
              </ul>

              <div className="cp-panel-footer"><span>{filteredAvailableViews.length} matching views</span>{selectedViewCodes.length > 0 && <div className="cp-bulk-grant"><span>{selectedViewCodes.length} selected</span><button type="button" onClick={() => startMockGrant(clientId, masterViews.filter((view) => selectedViewCodes.indexOf(view.code) !== -1))}><UiIcon name="plus" size={14} /> Grant selected</button></div>}</div>
            </article>

            <article className="views-column cp-views-panel cp-entitled-panel">
              <div className="cp-panel-heading">
                <span className="cp-panel-heading-icon cp-icon-entitled"><UiIcon name="shield" size={19} /></span>
                <div className="cp-panel-heading-copy"><h2>Client entitlements</h2><p>Access already active or being processed</p></div>
                <span className="count-pill cp-count-pill cp-count-purple">{activeViews.length + inProgressCount + failedCount}</span>
              </div>

              <div className="cp-entitlement-tabs" role="tablist" aria-label="Filter entitlements by status">
                {[
                  { code: 'ALL' as StatusFilter, label: 'All', count: activeViews.length + inProgressCount + failedCount },
                  { code: 'ACTIVE' as StatusFilter, label: 'Active', count: activeViews.length },
                  { code: 'IN_PROGRESS' as StatusFilter, label: 'In progress', count: inProgressCount },
                  { code: 'FAILED' as StatusFilter, label: 'Failed', count: failedCount },
                ].map((tab) => <button key={tab.code} type="button" role="tab" aria-selected={entitledStatus === tab.code} className={`cp-entitlement-tab ${entitledStatus === tab.code ? 'active' : ''}`} onClick={() => setEntitledStatus(tab.code)}>{tab.label}<span>{tab.count}</span></button>)}
              </div>

              <label className="cp-search-box cp-view-search cp-entitled-search">
                <UiIcon name="search" size={16} />
                <input value={viewSearch.entitled} onChange={(event) => updateViewSearch('entitled', event.target.value)} placeholder="Search client entitlements…" aria-label="Search client entitlements" />
                {viewSearch.entitled && <button type="button" aria-label="Clear entitlement search" onClick={() => updateViewSearch('entitled', '')}><UiIcon name="close" size={13} /></button>}
              </label>

              <ul className="views-list cp-view-list cp-entitled-list" aria-label="Client entitlements">
                {filteredEntitledViews.map((view) => {
                  const status = getViewStatus(view.code);
                  return (
                    <li key={view.code} className={`view-item cp-view-card cp-entitled-card cp-entitled-${status.toLowerCase().replace('_', '-')}`}>
                      <span className={`cp-view-icon cp-view-icon-${view.categoryCode.toLowerCase()}`}><UiIcon name="database" size={16} /></span>
                      <span className="cp-view-copy"><strong title={view.name}>{view.name}</strong><small title={view.description}>{view.description}</small></span>
                      {renderCategoryBadge(view.categoryCode)}
                      <span className="cp-entitlement-status-wrap">{renderStatus(status)}<small>{getStatusCopy(view.code)}</small></span>
                      <span className="cp-row-action-wrap">
                        {status === 'ACTIVE' && <button type="button" className="cp-icon-action cp-revoke-action" title={`Revoke ${view.name}`} aria-label={`Revoke ${view.name}`} onClick={() => revokeView(view.code)}><UiIcon name="trash" size={15} /></button>}
                        {status === 'IN_PROGRESS' && <button type="button" className="cp-cancel-action" onClick={() => cancelRequest(view.code)}>Cancel</button>}
                        {status === 'FAILED' && <button type="button" className="cp-retry-action" onClick={() => retryRequest(view.code)}><UiIcon name="refresh" size={13} /> Retry</button>}
                      </span>
                    </li>
                  );
                })}
                {filteredEntitledViews.length === 0 && <li className="empty-state cp-empty-state"><span className="cp-empty-icon"><UiIcon name="database" size={20} /></span><strong>No matching entitlements</strong><p>Try a different status or category filter.</p></li>}
              </ul>

              {inProgressCount > 0 && <div className="cp-progress-note"><span className="cp-progress-note-icon"><UiIcon name="info" size={16} /></span><span><strong>Access requests are processing</strong><small>New secure views may take up to 2 minutes to become active.</small></span></div>}
              <div className="cp-panel-footer cp-entitled-footer"><span><i className="cp-live-dot" /> Status updates appear here</span><span>{activeViews.length} active</span></div>
            </article>
          </section>
        </main>
      </div>

      {catalogOpen && <div className="cp-catalog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCatalogOpen(false); }}>
        <aside className="cp-catalog-drawer" role="dialog" aria-modal="true" aria-labelledby="cp-catalog-title">
          <div className="cp-drawer-header"><span className="cp-drawer-icon"><UiIcon name="database" size={20} /></span><div><h2 id="cp-catalog-title">Global System Catalog</h2><p>Master list of secure views</p></div><button type="button" className="cp-drawer-close" onClick={() => setCatalogOpen(false)} aria-label="Close global catalog"><UiIcon name="close" size={17} /></button></div>
          <div className="cp-drawer-meta"><span className="cp-readonly-pill">Read-only</span><span className="cp-drawer-count">{masterViews.length} views</span></div>
          <label className="cp-search-box cp-drawer-search"><UiIcon name="search" size={16} /><input value={viewSearch.catalog} onChange={(event) => updateViewSearch('catalog', event.target.value)} placeholder="Search global catalog…" aria-label="Search global catalog" />{viewSearch.catalog && <button type="button" aria-label="Clear catalog search" onClick={() => updateViewSearch('catalog', '')}><UiIcon name="close" size={13} /></button>}</label>
          <div className="cp-drawer-category-heading"><span>Categories</span><span>{filteredCatalogViews.length} results</span></div>
          <div className="cp-drawer-category-pills">{CLIENT_PROFILES_MOCK_DATA.categories.map((category) => <button key={category.code} type="button" className={`cp-drawer-category ${catalogCategory === category.code ? 'active' : ''}`} onClick={() => setCatalogCategory(category.code)}>{category.label}</button>)}</div>
          <ul className="cp-catalog-list" aria-label="Global secure view catalog">
            {filteredCatalogViews.map((view) => {
              const status: 'ACTIVE' | RequestStatus | 'AVAILABLE' = activeViewCodeSet.has(view.code) ? 'ACTIVE' : clientRequestStates[view.code] ?? 'AVAILABLE';
              const statusLabel = status === 'AVAILABLE' ? 'Not entitled' : status === 'ACTIVE' ? 'Active for client' : status === 'IN_PROGRESS' ? 'Request in progress' : 'Request failed';
              return <li key={view.code} className="cp-catalog-item"><span className={`cp-view-icon cp-view-icon-${view.categoryCode.toLowerCase()}`}><UiIcon name="database" size={16} /></span><span className="cp-view-copy"><strong title={view.name}>{view.name}</strong><small>{view.description}</small><span className={`cp-catalog-access cp-catalog-access-${status.toLowerCase().replace('_', '-')}`}><i />{statusLabel}</span></span>{renderCategoryBadge(view.categoryCode)}</li>;
            })}
            {filteredCatalogViews.length === 0 && <li className="cp-drawer-empty">No secure views match your search.</li>}
          </ul>
          <div className="cp-drawer-footer"><UiIcon name="info" size={15} /><span>This catalog is for reference only. Grant or revoke access from the main workspace.</span></div>
        </aside>
      </div>}
    </div>
  );
};

export default ClientProfiles;
