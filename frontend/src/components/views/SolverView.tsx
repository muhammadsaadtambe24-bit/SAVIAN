import React from 'react';
import {
  Cpu,
  Play,
  Layers,
  Sparkles,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
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
      <div className="neumorphic-card rounded-2xl p-5 border-[#e2dcd0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800 border border-emerald-300/70 shadow-sm">
                <Cpu className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight font-sans">
                OR-Tools CP-SAT Block Scheduling Engine
              </h2>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Mixed Integer Programming • Multi-Objective Pareto Frontier • Kavach Braking Distance Constraints
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="railway"
              size="default"
              onClick={onRunSolver}
              disabled={solverStatus === 'solving'}
              className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
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

        {/* Solver Metrics Strip - Warm Neumorphic Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-[#e8e2d4]">
          <div className="rounded-xl bg-white/90 p-3 border border-stone-200/90 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Solve Status</span>
            <div className="mt-1 flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-emerald-800 font-mono">
                {solverResult.status}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white/90 p-3 border border-stone-200/90 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Optimality Gap</span>
            <div className="mt-1 text-xs font-black text-sky-800 font-mono">
              {solverResult.optimality_gap.toFixed(2)}%
            </div>
          </div>

          <div className="rounded-xl bg-white/90 p-3 border border-stone-200/90 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Wall Time</span>
            <div className="mt-1 text-xs font-black text-stone-900 font-mono">
              {solverResult.wall_time_sec}s
            </div>
          </div>

          <div className="rounded-xl bg-white/90 p-3 border border-stone-200/90 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Objective Value</span>
            <div className="mt-1 text-xs font-black text-indigo-800 font-mono">
              {solverResult.objective_value}
            </div>
          </div>

          <div className="rounded-xl bg-white/90 p-3 border border-stone-200/90 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Shadow Merges</span>
            <div className="mt-1 text-xs font-black text-emerald-700 font-mono">
              {solverResult.shadow_merges} Blocks
            </div>
          </div>

          <div className="rounded-xl bg-white/90 p-3 border border-stone-200/90 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-stone-400 font-mono">Clashes Detected</span>
            <div className="mt-1 text-xs font-black text-stone-600 font-mono">
              {solverResult.clashes_detected}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Explainable AI & Telemetry Iterations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: XAI Conflict Resolutions & Shadow Merges */}
        <div className="neumorphic-card rounded-2xl p-5 space-y-4 bg-[#fbf9f4]">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d4]">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-stone-900 font-sans">
                Explainable AI (XAI) Decisions
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300">
              Constraint Logic
            </span>
          </div>

          {/* Conflict Resolutions */}
          <div>
            <span className="text-xs font-bold text-stone-600">
              Resolved Schedule Shifts & Rationale
            </span>
            <div className="mt-2.5 space-y-2.5">
              {solverResult.xai.conflict_resolutions.map((res, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white/95 border border-stone-200/90 p-3.5 text-xs space-y-1.5 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-extrabold text-stone-900">
                      {res.block_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        res.shifted_minutes > 0
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {res.shifted_minutes > 0 ? `+${res.shifted_minutes} min` : `${res.shifted_minutes} min`}
                    </span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed font-medium">
                    {res.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shadow Block Merges */}
          <div className="pt-3 border-t border-[#e8e2d4]">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-600" />
              Harmonized Shadow Blocks (Zero Additional Corridor Cost)
            </span>
            <div className="mt-2.5 space-y-2">
              {solverResult.xai.shadow_detections.map((shadow, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-emerald-50/90 border border-emerald-200 p-3.5 text-xs shadow-sm"
                >
                  <div className="flex justify-between items-center font-mono text-[11px]">
                    <span className="text-stone-800 font-bold">{shadow.primary}</span>
                    <span className="text-emerald-800 font-extrabold bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                      Saved: {shadow.time_saved_hours}h
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-stone-600 font-medium">
                    Shadowed block: <span className="text-emerald-800 font-mono font-bold">{shadow.shadow}</span> nested inside primary track occupation window.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Solver Convergence & Telemetry Events */}
        <div className="neumorphic-card rounded-2xl p-5 space-y-4 bg-[#fbf9f4]">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d4]">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-stone-900 font-sans">
                Convergence Telemetry Stream
              </h3>
            </div>
            <span className="font-mono text-xs text-stone-400 font-semibold">
              Branch & Bound
            </span>
          </div>

          {/* Telemetry Progress Visualizer */}
          <div className="space-y-3">
            <p className="text-xs text-stone-500 font-medium">
              Real-time objective relaxation bound tightening towards global optimum:
            </p>

            <div className="rounded-xl bg-[#ede9df] border border-[#dcd4c6] p-3.5 space-y-3 shadow-inner">
              {telemetryData.map((event) => {
                const gap = Math.abs(event.objective_cost - event.best_bound);
                const progressPct = Math.max(10, 100 - (gap / event.objective_cost) * 100);

                return (
                  <div key={event.iteration} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-stone-600 font-bold">Iter #{event.iteration}</span>
                      <span className="text-stone-700 font-semibold">Cost: {event.objective_cost.toFixed(1)}</span>
                      <span className="text-sky-800 font-semibold">Bound: {event.best_bound.toFixed(1)}</span>
                      <span className="text-emerald-700 font-black">{event.time_sec}s</span>
                    </div>
                    <div className="h-2 w-full bg-[#d8d0c0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, progressPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Train Slot Adjustments Preview */}
          <div className="pt-3 border-t border-[#e8e2d4]">
            <span className="text-xs font-bold text-stone-700">
              Punctuality Schedule Impact (Bhopal Section)
            </span>
            <div className="mt-2.5 space-y-2">
              {Object.entries(solverResult.train_schedules).map(([train, sched]) => (
                <div
                  key={train}
                  className="flex items-center justify-between text-xs bg-white/95 px-3 py-2 rounded-xl border border-stone-200 font-mono shadow-sm"
                >
                  <span className="text-stone-800 font-bold truncate max-w-[200px]">{train}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-stone-500 font-medium">
                      {Math.floor(sched.start / 60)}:{String(sched.start % 60).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sched.delay === 0
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {sched.delay === 0 ? 'ON TIME' : `+${sched.delay}m`}
                    </span>
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

