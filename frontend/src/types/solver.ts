// solver.ts
export interface SolverResult {
  solve_id: string;
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE';
  objective_value: number;
  optimality_gap: number;
  wall_time_sec: number;
  train_schedules: Record<string, { start: number; end: number; delay: number }>;
  block_schedules: Record<
    string,
    {
      start: number;
      end: number;
      section: string;
      is_shadow: boolean;
      shadow_parent?: string;
    }
  >;
  clashes_detected: number;
  shadow_merges: number;
  xai: XAIData;
}

export interface XAIData {
  conflict_resolutions: { block_id: string; shifted_minutes: number; reason: string }[];
  shadow_detections: { primary: string; shadow: string; time_saved_hours: number }[];
  constraint_waterfall: { train_delay_pct: number; block_deviation_pct: number; shadow_bonus_pct: number };
}

export interface GrantedBlock {
  id: number;
  solve_id: string;
  demand_id: number;
  demand_code: string;
  granted_start_minutes: number;
  granted_end_minutes: number;
  section_from: string;
  section_to: string;
  is_shadow: boolean;
  shadow_parent_id?: number;
}
