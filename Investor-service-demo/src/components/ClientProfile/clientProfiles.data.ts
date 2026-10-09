import type { ClientProfilesMockData } from './clientProfiles.types';

export const CLIENT_PROFILES_MOCK_DATA: ClientProfilesMockData = {
  clients: [
    { id: 'hostplus', name: 'HOSTPLUSPTYLIMITED', code: 'HPL-AU-001', segment: 'Superannuation', region: 'APAC', status: 'ACTIVE' },
    { id: 'northstar', name: 'NORTHSTAR CAPITAL', code: 'NSC-UK-014', segment: 'Asset Manager', region: 'EMEA', status: 'ACTIVE' },
    { id: 'harbor', name: 'HARBOR INVESTMENTS', code: 'HBI-US-028', segment: 'Investment Firm', region: 'AMER', status: 'ACTIVE' },
    { id: 'summit', name: 'SUMMIT TRUST GROUP', code: 'STG-UK-032', segment: 'Trust Services', region: 'EMEA', status: 'INACTIVE' },
    { id: 'bluewave', name: 'BLUEWAVE PARTNERS', code: 'BWP-SG-044', segment: 'Fund Services', region: 'APAC', status: 'ACTIVE' },
  ],
  categories: [
    { code: 'ALL', label: 'All views' },
    { code: 'ACCOUNT', label: 'Account' },
    { code: 'CSDR', label: 'CSDR' },
    { code: 'FUNDS', label: 'Funds' },
    { code: 'INTRADAY', label: 'Intraday' },
    { code: 'MT564', label: 'MT564' },
  ],
  masterViews: [
    { code: 'ACCOUNT_MASTER_SV', name: 'ACCOUNT_MASTER_SV', categoryCode: 'ACCOUNT', description: 'Core account and client reference data.' },
    { code: 'ACCOUNT_BALANCE_AUD_SV', name: 'ACCOUNT_BALANCE_AUD_SV', categoryCode: 'ACCOUNT', description: 'Account balance details in AUD.' },
    { code: 'CSDR_PENALTY_CALCULATION_DETAIL_AUD_SV', name: 'CSDR_PENALTY_CALCULATION_DETAIL_AUD_SV', categoryCode: 'CSDR', description: 'CSDR penalty calculation details in AUD.' },
    { code: 'CSDR_PENALTY_FAIL_STATUS_LR_SV', name: 'CSDR_PENALTY_FAIL_STATUS_LR_SV', categoryCode: 'CSDR', description: 'Settlement fail status and penalty information.' },
    { code: 'CSDR_SETTLEMENT_INSTRUCTION_SV', name: 'CSDR_SETTLEMENT_INSTRUCTION_SV', categoryCode: 'CSDR', description: 'Settlement instructions and processing status.' },
    { code: 'FUNDS_FA_POSITION_AUD_SV', name: 'FUNDS_FA_POSITION_AUD_SV', categoryCode: 'FUNDS', description: 'Fund accounting position data in AUD.' },
    { code: 'FUNDS_FA_VALUATION_AUD_SV', name: 'FUNDS_FA_VALUATION_AUD_SV', categoryCode: 'FUNDS', description: 'Fund valuation data in AUD.' },
    { code: 'INTRADAY_CASH_MOVEMENT_SV', name: 'INTRADAY_CASH_MOVEMENT_SV', categoryCode: 'INTRADAY', description: 'Intraday cash movements and balances.' },
    { code: 'INTRADAY_POSITION_SUMMARY_SV', name: 'INTRADAY_POSITION_SUMMARY_SV', categoryCode: 'INTRADAY', description: 'Latest intraday position summary.' },
    { code: 'MT564_CORPORATE_ACTION_SV', name: 'MT564_CORPORATE_ACTION_SV', categoryCode: 'MT564', description: 'Corporate action notification data.' },
    { code: 'MT564_ELECTION_STATUS_SV', name: 'MT564_ELECTION_STATUS_SV', categoryCode: 'MT564', description: 'Corporate action election status.' },
  ],
  entitlements: [
    { clientId: 'hostplus', viewCode: 'ACCOUNT_MASTER_SV', status: 'ACTIVE', grantedAt: '2026-09-18T08:30:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'hostplus', viewCode: 'FUNDS_FA_POSITION_AUD_SV', status: 'ACTIVE', grantedAt: '2026-09-20T10:15:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'hostplus', viewCode: 'FUNDS_FA_VALUATION_AUD_SV', status: 'ACTIVE', grantedAt: '2026-09-22T09:10:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'hostplus', viewCode: 'MT564_CORPORATE_ACTION_SV', status: 'ACTIVE', grantedAt: '2026-09-25T12:00:00.000Z', grantedBy: 'demo.operator' },
   
    { clientId: 'hostplus', viewCode: 'ACCOUNT_MASTER_SV', status: 'ACTIVE', grantedAt: '2026-09-18T08:30:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'hostplus', viewCode: 'FUNDS_FA_POSITION_AUD_SV', status: 'ACTIVE', grantedAt: '2026-09-20T10:15:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'hostplus', viewCode: 'FUNDS_FA_VALUATION_AUD_SV', status: 'ACTIVE', grantedAt: '2026-09-22T09:10:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'hostplus', viewCode: 'MT564_CORPORATE_ACTION_SV', status: 'ACTIVE', grantedAt: '2026-09-25T12:00:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'northstar', viewCode: 'ACCOUNT_MASTER_SV', status: 'ACTIVE', grantedAt: '2026-09-12T07:00:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'northstar', viewCode: 'CSDR_SETTLEMENT_INSTRUCTION_SV', status: 'ACTIVE', grantedAt: '2026-09-12T07:30:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'northstar', viewCode: 'MT564_ELECTION_STATUS_SV', status: 'ACTIVE', grantedAt: '2026-09-13T08:00:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'harbor', viewCode: 'ACCOUNT_BALANCE_AUD_SV', status: 'ACTIVE', grantedAt: '2026-09-10T11:00:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'harbor', viewCode: 'FUNDS_FA_VALUATION_AUD_SV', status: 'ACTIVE', grantedAt: '2026-09-10T12:00:00.000Z', grantedBy: 'demo.operator' },
    { clientId: 'bluewave', viewCode: 'ACCOUNT_MASTER_SV', status: 'ACTIVE', grantedAt: '2026-09-04T09:00:00.000Z', grantedBy: 'demo.operator' },
  ],
};
