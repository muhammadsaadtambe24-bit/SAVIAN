import React from 'react';
import {
  Cpu,
  Play,
  Layers,
  Sparkles,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SolverResult, TelemetryEvent } from '@/types';
import { MOCK_SOLVER_RESULT, MOCK_TELEMETRY } from '@/data/mockData';

interface SolverViewProps {
  solverStatus: 'idle' | 'solving' | 'done';
  onRunSolver: () => void;
  solverResult?: SolverResult;
  telemetryData?: TelemetryEvent[];
}

export const SolverView: React.FC<SolverViewProps> = ({
  solverStatus,
  onRunSolver,
  solverResult = MOCK_SOLVER_RESULT,
  telemetryData = MOCK_TELEMETRY,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Control Cockpit */}
      <div className="glass-panel rounded-xl p-5 border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-blue-600/20 p-2 text-blue-400 border border-blue-500/30">
                <Cpu className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-white tracking-wide">
                OR-Tools CP-SAT Block Scheduling Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Mixed Integer Programming • Multi-Objective Pareto Frontier • Kavach Braking Distance Constraints
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="railway"
              size="default"
              onClick={onRunSolver}
              disabled={solverStatus === 'solving'}
              className="font-semibold shadow-lg"
            >
              {solverStatus === 'solving' ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin text-white" />
                  Solving CP-SAT...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4 fill-current text-white" />
                  Run AI Optimization
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Solver Metrics Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800">
          <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Solve Status</span>
            <div className="mt-1 flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 signal-green" />
              <span className="text-xs font-bold text-emerald-300 font-mono">
                {solverResult.status}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Optimality Gap</span>
            <div className="mt-1 text-xs font-bold text-blue-300 font-mono">
              {solverResult.optimality_gap.toFixed(2)}%
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Wall Time</span>
            <div className="mt-1 text-xs font-bold text-white font-mono">
              {solverResult.wall_time_sec}s
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Objective Value</span>
            <div className="mt-1 text-xs font-bold text-purple-300 font-mono">
              {solverResult.objective_value}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Shadow Merges</span>
            <div className="mt-1 text-xs font-bold text-emerald-400 font-mono">
              {solverResult.shadow_merges} Blocks
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Clashes Detected</span>
            <div className="mt-1 text-xs font-bold text-slate-400 font-mono">
              {solverResult.clashes_detected}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Explainable AI & Telemetry Iterations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: XAI Conflict Resolutions & Shadow Merges */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Explainable AI (XAI) Decisions
              </h3>
            </div>
            <Badge variant="railway" className="text-[10px]">
              Constraint Logic
            </Badge>
          </div>

          {/* Conflict Resolutions */}
          <div>
            <span className="text-xs font-semibold text-slate-300">
              Resolved Schedule Shifts & Rationale
            </span>
            <div className="mt-2 space-y-2.5">
              {solverResult.xai.conflict_resolutions.map((res, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-blue-400">
                      {res.block_id}
                    </span>
                    <Badge variant={res.shifted_minutes > 0 ? 'warning' : 'info'} className="text-[10px]">
                      {res.shifted_minutes > 0 ? `+${res.shifted_minutes} min` : `${res.shifted_minutes} min`}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {res.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shadow Block Merges */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
              Harmonized Shadow Blocks (Zero Additional Corridor Cost)
            </span>
            <div className="mt-2 space-y-2">
              {solverResult.xai.shadow_detections.map((shadow, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-3 text-xs"
                >
                  <div className="flex justify-between items-center font-mono text-[11px]">
                    <span className="text-slate-300">{shadow.primary}</span>
                    <span className="text-emerald-400 font-bold">
                      Saved: {shadow.time_saved_hours}h
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Shadowed block: <span className="text-emerald-300 font-mono">{shadow.shadow}</span> nested inside primary track occupation window.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Solver Convergence & Telemetry Events */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Convergence Telemetry Stream
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500">
              Branch & Bound
            </span>
          </div>

          {/* Telemetry Progress Visualizer */}
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Real-time objective relaxation bound tightening towards global optimum:
            </p>

            <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-3">
              {telemetryData.map((event) => {
                const gap = Math.abs(event.objective_cost - event.best_bound);
                const progressPct = Math.max(10, 100 - (gap / event.objective_cost) * 100);

                return (
                  <div key={event.iteration} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Iter #{event.iteration}</span>
                      <span className="text-slate-300">Cost: {event.objective_cost.toFixed(1)}</span>
                      <span className="text-blue-400">Bound: {event.best_bound.toFixed(1)}</span>
                      <span className="text-emerald-400">{event.time_sec}s</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, progressPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Train Slot Adjustments Preview */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300">
              Punctuality Schedule Impact (Bhopal Section)
            </span>
            <div className="mt-2 space-y-1.5">
              {Object.entries(solverResult.train_schedules).map(([train, sched]) => (
                <div
                  key={train}
                  className="flex items-center justify-between text-xs bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800 font-mono"
                >
                  <span className="text-slate-300 truncate max-w-[200px]">{train}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">
                      {Math.floor(sched.start / 60)}:{String(sched.start % 60).padStart(2, '0')}
                    </span>
                    <Badge
                      variant={sched.delay === 0 ? 'success' : 'warning'}
                      className="text-[10px] px-1 py-0 h-4"
                    >
                      {sched.delay === 0 ? 'ON TIME' : `+${sched.delay}m`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
