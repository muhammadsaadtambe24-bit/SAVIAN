import type { SolverResult, XAIData } from './types';

export const mockSolverResult: SolverResult = {
  blocks: [
    { id: 'b1', demand_code: 'OHE/KYN/2024/001', section: 'CSMT-TNA', start_km: 0, end_km: 55, start_time: '2024-03-15T01:00:00', end_time: '2024-03-15T04:30:00', block_type: 'OHE', priority: 'CRITICAL', corridor_night: 1 },
    { id: 'b2', demand_code: 'TRK/KYN/2024/002', section: 'TNA-KYN', start_km: 55, end_km: 110, start_time: '2024-03-15T01:30:00', end_time: '2024-03-15T05:00:00', block_type: 'TRACK', priority: 'HIGH', corridor_night: 1 },
    { id: 'b3', demand_code: 'SIG/KYN/2024/003', section: 'KYN-KJT', start_km: 110, end_km: 145, start_time: '2024-03-16T00:30:00', end_time: '2024-03-16T04:00:00', block_type: 'SIGNAL', priority: 'MEDIUM', corridor_night: 2 },
    { id: 'b4', demand_code: 'OHE/KYN/2024/004', section: 'KJT-LNL', start_km: 145, end_km: 190, start_time: '2024-03-16T01:00:00', end_time: '2024-03-16T05:30:00', block_type: 'OHE', priority: 'CRITICAL', corridor_night: 2 },
    { id: 'b5', demand_code: 'GEN/KYN/2024/005', section: 'LNL-IGP', start_km: 190, end_km: 230, start_time: '2024-03-17T02:00:00', end_time: '2024-03-17T05:00:00', block_type: 'GENERAL', priority: 'LOW', corridor_night: 3 },
    { id: 'b6', demand_code: 'TRK/KYN/2024/006', section: 'CSMT-TNA', start_km: 0, end_km: 55, start_time: '2024-03-18T01:00:00', end_time: '2024-03-18T04:00:00', block_type: 'TRACK', priority: 'HIGH', corridor_night: 4 },
    { id: 'b7', demand_code: 'OHE/KYN/2024/007', section: 'TNA-KYN', start_km: 55, end_km: 110, start_time: '2024-03-19T00:30:00', end_time: '2024-03-19T04:30:00', block_type: 'OHE', priority: 'CRITICAL', corridor_night: 5 },
    { id: 'b8', demand_code: 'SIG/KYN/2024/008', section: 'KYN-KJT', start_km: 110, end_km: 145, start_time: '2024-03-20T01:00:00', end_time: '2024-03-20T04:00:00', block_type: 'SIGNAL', priority: 'MEDIUM', corridor_night: 6 },
  ],
  trains: [
    { id: 't1', train_number: '12124', from_station: 'CSMT', to_station: 'PNE', departure: '2024-03-15T00:15:00', arrival: '2024-03-15T04:30:00', path_km: [[0, 0], [55, 1], [110, 2], [190, 3.5], [230, 4.25]], delay_minutes: 0 },
    { id: 't2', train_number: '11030', from_station: 'CSMT', to_station: 'IGP', departure: '2024-03-15T01:00:00', arrival: '2024-03-15T05:00:00', path_km: [[0, 0], [55, 1.5], [110, 2.5], [145, 3], [190, 3.75], [230, 4]], delay_minutes: 12 },
    { id: 't3', train_number: '22222', from_station: 'CSMT', to_station: 'KYN', departure: '2024-03-15T02:00:00', arrival: '2024-03-15T03:30:00', path_km: [[0, 0], [55, 0.5], [110, 1.5]], delay_minutes: 5 },
    { id: 't4', train_number: '12140', from_station: 'KYN', to_station: 'CSMT', departure: '2024-03-15T03:00:00', arrival: '2024-03-15T05:00:00', path_km: [[110, 0], [55, 1], [0, 2]], delay_minutes: 8 },
  ],
  conflicts: [
    { id: 'c1', demand_code: 'OHE/KYN/2024/001', shifted_minutes: 45, reason: 'Conflicted with Train 12124 Rajdhani path — shifted to allow safe passage', severity: 'HIGH', original_start: '2024-03-15T00:15:00', new_start: '2024-03-15T01:00:00' },
    { id: 'c2', demand_code: 'TRK/KYN/2024/002', shifted_minutes: 15, reason: 'Adjacent block OHE/KYN/2024/001 requires 30-min buffer for energization', severity: 'LOW', original_start: '2024-03-15T01:15:00', new_start: '2024-03-15T01:30:00' },
    { id: 'c3', demand_code: 'SIG/KYN/2024/003', shifted_minutes: 30, reason: 'Speed restriction zone conflict with maintenance equipment movement', severity: 'MEDIUM', original_start: '2024-03-16T00:00:00', new_start: '2024-03-16T00:30:00' },
    { id: 'c4', demand_code: 'OHE/KYN/2024/004', shifted_minutes: 60, reason: 'Critical defect repair window must not overlap with corridor block on adjacent track', severity: 'HIGH', original_start: '2024-03-16T00:00:00', new_start: '2024-03-16T01:00:00' },
  ],
  shadows: [
    { id: 's1', primary_code: 'OHE/KYN/2024/001', shadow_code: 'TRK/KYN/2024/002', hours_saved: 2.5, merged_section: 'CSMT-KYN' },
    { id: 's2', primary_code: 'OHE/KYN/2024/004', shadow_code: 'SIG/KYN/2024/003', hours_saved: 1.5, merged_section: 'KYN-LNL' },
    { id: 's3', primary_code: 'OHE/KYN/2024/007', shadow_code: 'TRK/KYN/2024/006', hours_saved: 3.0, merged_section: 'CSMT-KYN' },
  ],
  objective: {
    train_delay: 35,
    block_deviation: 25,
    shadow_bonus: -15,
    speed_debt: 10,
    total: 55,
  },
  physical_clashes: 0,
  sla_percentage: 100,
  corridor_nights: 8,
  solve_time_ms: 2340,
};

export const mockChaosResult: SolverResult = {
  blocks: [
    { id: 'cb1', demand_code: 'OHE/KYN/2024/001', section: 'CSMT-TNA', start_km: 0, end_km: 55, start_time: '2024-03-15T00:15:00', end_time: '2024-03-15T04:00:00', block_type: 'OHE', priority: 'CRITICAL', corridor_night: 1 },
    { id: 'cb2', demand_code: 'TRK/KYN/2024/002', section: 'TNA-KYN', start_km: 55, end_km: 110, start_time: '2024-03-15T00:45:00', end_time: '2024-03-15T04:30:00', block_type: 'TRACK', priority: 'HIGH', corridor_night: 1 },
    { id: 'cb3', demand_code: 'SIG/KYN/2024/003', section: 'KYN-KJT', start_km: 110, end_km: 145, start_time: '2024-03-16T00:00:00', end_time: '2024-03-16T03:30:00', block_type: 'SIGNAL', priority: 'MEDIUM', corridor_night: 2 },
    { id: 'cb4', demand_code: 'OHE/KYN/2024/004', section: 'KJT-LNL', start_km: 145, end_km: 190, start_time: '2024-03-16T00:00:00', end_time: '2024-03-16T05:00:00', block_type: 'OHE', priority: 'CRITICAL', corridor_night: 2 },
    { id: 'cb5', demand_code: 'GEN/KYN/2024/005', section: 'LNL-IGP', start_km: 190, end_km: 230, start_time: '2024-03-17T02:00:00', end_time: '2024-03-17T05:00:00', block_type: 'GENERAL', priority: 'LOW', corridor_night: 3 },
    { id: 'cb6', demand_code: 'TRK/KYN/2024/006', section: 'CSMT-TNA', start_km: 0, end_km: 55, start_time: '2024-03-18T01:00:00', end_time: '2024-03-18T04:00:00', block_type: 'TRACK', priority: 'HIGH', corridor_night: 4 },
    { id: 'cb7', demand_code: 'OHE/KYN/2024/007', section: 'TNA-KYN', start_km: 55, end_km: 110, start_time: '2024-03-19T00:30:00', end_time: '2024-03-19T04:30:00', block_type: 'OHE', priority: 'CRITICAL', corridor_night: 5 },
  ],
  trains: [
    { id: 'ct1', train_number: '12124', from_station: 'CSMT', to_station: 'PNE', departure: '2024-03-15T00:15:00', arrival: '2024-03-15T04:30:00', path_km: [[0, 0], [55, 1], [110, 2], [190, 3.5], [230, 4.25]], delay_minutes: 25 },
    { id: 'ct2', train_number: '11030', from_station: 'CSMT', to_station: 'IGP', departure: '2024-03-15T01:00:00', arrival: '2024-03-15T05:00:00', path_km: [[0, 0], [55, 1.5], [110, 2.5], [145, 3], [190, 3.75], [230, 4]], delay_minutes: 40 },
  ],
  conflicts: [],
  shadows: [],
  objective: {
    train_delay: 65,
    block_deviation: 45,
    shadow_bonus: 0,
    speed_debt: 30,
    total: 140,
  },
  physical_clashes: 3,
  sla_percentage: 83,
  corridor_nights: 7,
  solve_time_ms: 0,
};

export const mockXAIData: XAIData = {
  conflicts: mockSolverResult.conflicts,
  shadows: mockSolverResult.shadows,
  objective: mockSolverResult.objective,
};
