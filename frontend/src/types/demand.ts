// demand.ts
export interface BlockDemand {
  id: number;
  demand_code: string;
  source_system: 'TMS' | 'SMMS' | 'TDMS';
  department: 'P_WAY' | 'OHE' | 'S_AND_T';
  section_from: string;
  section_to: string;
  start_km: number;
  end_km: number;
  requested_date: string;
  requested_start_minutes: number;
  requested_end_minutes: number;
  required_minutes: number;
  activity_description: string;
  machinery_type?: string;
  machinery_id?: string;
  status: 'PROPOSED' | 'REVIEWED' | 'APPROVED' | 'EXECUTED' | 'CLOSED' | 'REJECTED';
  trust_score: number;
  severity_tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priority_weight: number;
  power_block_required: boolean;
  disconnection_required: boolean;
  speed_restriction_kmph?: number;
}
