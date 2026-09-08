export interface Block {
  id: string;
  demand_code: string;
  section: string;
  start_km: number;
  end_km: number;
  start_time: string; // ISO datetime
  end_time: string;
  block_type: 'OHE' | 'TRACK' | 'SIGNAL' | 'GENERAL';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  corridor_night: number; // which corridor night (1-8)
}

export interface TrainPath {
  id: string;
  train_number: string;
  from_station: string;
  to_station: string;
  departure: string;
  arrival: string;
  path_km: [number, number][];
  delay_minutes: number;
}

export interface ConflictResolution {
  id: string;
  demand_code: string;
  shifted_minutes: number;
  reason: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  original_start: string;
  new_start: string;
}

export interface ShadowMerge {
  id: string;
  primary_code: string;
  shadow_code: string;
  hours_saved: number;
  merged_section: string;
}

export interface ObjectiveBreakdown {
  train_delay: number;
  block_deviation: number;
  shadow_bonus: number;
  speed_debt: number;
  total: number;
}

export interface SolverResult {
  blocks: Block[];
  trains: TrainPath[];
  conflicts: ConflictResolution[];
  shadows: ShadowMerge[];
  objective: ObjectiveBreakdown;
  physical_clashes: number;
  sla_percentage: number;
  corridor_nights: number;
  solve_time_ms: number;
}

export interface XAIData {
  conflicts: ConflictResolution[];
  shadows: ShadowMerge[];
  objective: ObjectiveBreakdown;
}
