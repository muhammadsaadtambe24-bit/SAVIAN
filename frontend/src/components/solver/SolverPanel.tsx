import React from 'react';
import {
  Cpu,
  Play,
  Zap,
  RefreshCw,
  BarChart3,
  Timer,
  Target,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SolverResult, TelemetryEvent } from '@/types';
import { SolverStatus } from '@/hooks/useBlockTelemetry';
import { TelemetryChart } from './TelemetryChart';
import { cn } from '@/lib/utils';

interface SolverPanelProps {
  solverStatus: SolverStatus;
  isLoading: boolean;
  solveResult: SolverResult | null;
  telemetry: TelemetryEvent[];
  onColdSolve: () => void;
  onWarmStart: () => void;
  hasPriorSolve: boolean;
}

const STATUS_STYLES: Record<SolverStatus, { label: string; classes: string }> = {
  IDLE: { label: 'IDLE', classes: 'bg-slate-500/20 text-slate-400 border-slate-500/40' },
  SOLVING: { label: 'SOLVING', classes: 'bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse' },
  OPTIMAL: { label: 'OPTIMAL', classes: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  FEASIBLE: { label: 'FEASIBLE', classes: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  INFEASIBLE: { label: 'INFEASIBLE', classes: 'bg-red-500/20 text-red-400 border-red-500/40' },
};

export const SolverPanel: React.FC<SolverPanelProps> = ({
  solverStatus,
  isLoading,
  solveResult,
  telemetry,
  onColdSolve,
  onWarmStart,
  hasPriorSolve,
}) => {
  const statusStyle = STATUS_STYLES[solverStatus];
  const isSolving = solverStatus === 'SOLVING' || isLoading;

  return (
    <div className="glass-panel rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-blue-600/20 p-2 text-blue-400 border border-blue-500/30">
              <Cpu className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              OR-Tools CP-SAT Solver Controls
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Mixed Integer Programming • Branch & Bound • Kavach-Aware Constraints
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold font-mono',
              statusStyle.classes,
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                solverStatus === 'IDLE' && 'bg-slate-400',
                solverStatus === 'SOLVING' && 'bg-blue-400 animate-ping',
                solverStatus === 'OPTIMAL' && 'bg-emerald-400',
                solverStatus === 'FEASIBLE' && 'bg-amber-400',
                solverStatus === 'INFEASIBLE' && 'bg-red-400',
              )}
            />
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
        <Button
          onClick={onColdSolve}
          disabled={isSolving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/25"
        >
          {isSolving && solverStatus === 'SOLVING' ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Solving CP-SAT…
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4 fill-current" />
              Cold Solve (Full)
            </>
          )}
        </Button>

        <Button
          onClick={onWarmStart}
          disabled={isSolving || !hasPriorSolve}
          variant="outline"
          className={cn(
            'border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-semibold',
            !hasPriorSolve && 'opacity-40 cursor-not-allowed',
          )}
          title={!hasPriorSolve ? 'Run a Cold Solve first to enable warm-start' : undefined}
        >
          <Zap className="mr-2 h-4 w-4" />
          Warm-Start (Emergency)
        </Button>

        <span className="text-[10px] text-slate-500 font-mono ml-auto hidden sm:block">
          Cold: 8s limit • Warm: 3s limit
        </span>
      </div>

      {/* Stats Card (shown after solve) */}
      {solveResult && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800">
          <StatCell
            icon={<Target className="h-3.5 w-3.5 text-purple-400" />}
            label="Objective"
            value={solveResult.objective_value.toFixed(1)}
            color="text-purple-300"
          />
          <StatCell
            icon={<BarChart3 className="h-3.5 w-3.5 text-blue-400" />}
            label="Gap"
            value={`${solveResult.optimality_gap.toFixed(2)}%`}
            color="text-blue-300"
          />
          <StatCell
            icon={<Timer className="h-3.5 w-3.5 text-white" />}
            label="Wall Time"
            value={`${solveResult.wall_time_sec}s`}
            color="text-white"
          />
          <StatCell
            icon={<RefreshCw className="h-3.5 w-3.5 text-cyan-400" />}
            label="Iterations"
            value={String(telemetry.length)}
            color="text-cyan-300"
          />
          <StatCell
            icon={<AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
            label="Clashes"
            value={String(solveResult.clashes_detected)}
            color="text-red-300"
          />
          <StatCell
            icon={<Layers className="h-3.5 w-3.5 text-emerald-400" />}
            label="Shadow Merges"
            value={String(solveResult.shadow_merges)}
            color="text-emerald-300"
          />
        </div>
      )}

      {/* Telemetry Chart */}
      <TelemetryChart data={telemetry} solverStatus={solverStatus} />
    </div>
  );
};

/* ---------- StatCell sub-component ---------- */

const StatCell: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800">
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">{label}</span>
    </div>
    <div className={cn('mt-1 text-xs font-bold font-mono', color)}>{value}</div>
  </div>
);
