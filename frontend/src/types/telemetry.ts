// telemetry.ts
export interface TelemetryEvent {
  iteration: number;
  objective_cost: number;
  best_bound: number;
  time_sec: number;
}
