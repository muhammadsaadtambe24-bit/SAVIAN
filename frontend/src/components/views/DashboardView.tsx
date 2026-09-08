import React from 'react';
import {
  Activity,
  Layers,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Train,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_STATIONS, MOCK_DEMANDS, MOCK_SOLVER_RESULT } from '@/data/mockData';
import { formatMinutesToTime } from '@/lib/utils';

interface DashboardViewProps {
  chaosMode: boolean;
  onRunSolver: () => void;
  solverStatus: 'idle' | 'solving' | 'done';
  onNavigate: (view: 'dashboard' | 'demands' | 'solver' | 'lifecycle' | 'settings') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  chaosMode,
  onRunSolver,
  solverStatus,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Alert if in Chaos Mode */}
      {chaosMode && (
        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/50 p-4 shadow-lg shadow-amber-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400 border border-amber-500/30">
                <Zap className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-200">
                  Corridor Disruption Simulator Active (Chaos Mode)
                </h3>
                <p className="text-xs text-amber-300/80">
                  Simulating freight train slowdowns, speed restrictions, and sudden P-Way emergency tamping demands.
                </p>
              </div>
            </div>
            <Button
              variant="railway"
              size="sm"
              onClick={onRunSolver}
              disabled={solverStatus === 'solving'}
              className="bg-amber-600 hover:bg-amber-500 text-white shrink-0"
            >
              <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
              Re-optimize Corridor
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="glass-panel rounded-xl p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Demands</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black tracking-tight text-white font-mono">
              {MOCK_DEMANDS.length}
            </span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              +3 new today
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Critical: 2</span>
            <span>Reviewed: 1</span>
            <span className="text-emerald-400">Approved: 2</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel rounded-xl p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Shadow Block Savings</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black tracking-tight text-emerald-400 font-mono">
              3.5 hrs
            </span>
            <Badge variant="success" className="text-[10px]">
              2 Merges
            </Badge>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Co-aligning OHE & S&T under P-Way track possessions
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel rounded-xl p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Train Delay Impact</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black tracking-tight text-white font-mono">
              5.2 min
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              -62% vs manual
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Punctuality preserved across passenger and freight slots
          </p>
        </div>

        {/* Card 4 */}
        <div className="glass-panel rounded-xl p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Kavach Commissioned</span>
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400 border border-sky-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black tracking-tight text-sky-400 font-mono">
              98.7 km
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / 152.4 km
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Dynamic braking model active on 8 stations
          </p>
        </div>
      </div>

      {/* Interactive Corridor Chainage Ribbon */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Train className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Bina – Itarsi Section Strip Map (152.4 KM)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              West Central Railway • Bhopal Division • Real-time block locations & Kavach safety status
            </p>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 signal-green" /> Commissioned
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> In Trials
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-600" /> Not Equipped
            </span>
          </div>
        </div>

        {/* Station nodes scroll container */}
        <div className="mt-5 overflow-x-auto pb-3 pt-2">
          <div className="min-w-[850px] relative px-4">
            {/* Railroad Track Line */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-slate-800 rounded z-0" />
            <div className="absolute top-5 left-8 w-[65%] h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 rounded z-0 opacity-70" />

            {/* Station Nodes */}
            <div className="relative z-10 flex justify-between items-start">
              {MOCK_STATIONS.map((stn) => {
                const kavachColor =
                  stn.kavach_status === 'COMMISSIONED'
                    ? 'border-emerald-500 bg-emerald-950 text-emerald-300'
                    : stn.kavach_status === 'IN_TRIALS'
                    ? 'border-sky-500 bg-sky-950 text-sky-300'
                    : 'border-slate-700 bg-slate-900 text-slate-400';

                return (
                  <div key={stn.code} className="flex flex-col items-center group cursor-pointer">
                    <div
                      className={`h-9 w-9 rounded-full border-2 flex items-center justify-center font-mono text-[10px] font-bold shadow-md transition-transform group-hover:scale-110 ${kavachColor}`}
                      title={`${stn.name} (KM ${stn.distance_km}) - Kavach: ${stn.kavach_status}`}
                    >
                      {stn.code.slice(0, 3)}
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                      {stn.code}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {stn.distance_km}k
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Split Section: Active Blocks & Explainable AI (XAI) Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Demands & Scheduled Blocks */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Granted Maintenance Blocks
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('demands')}
              className="text-xs text-blue-400 border-slate-800 hover:border-blue-500/50"
            >
              View All Demands
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-3">
            {MOCK_DEMANDS.slice(0, 3).map((demand) => (
              <div
                key={demand.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-slate-900/90 border border-slate-800/80 p-3.5 hover:border-slate-700 transition-all gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {demand.demand_code}
                    </span>
                    <Badge
                      variant={
                        demand.department === 'P_WAY'
                          ? 'railway'
                          : demand.department === 'OHE'
                          ? 'warning'
                          : 'info'
                      }
                      className="text-[10px]"
                    >
                      {demand.department}
                    </Badge>
                    <Badge
                      variant={
                        demand.severity_tier === 'CRITICAL'
                          ? 'destructive'
                          : demand.severity_tier === 'HIGH'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {demand.severity_tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {demand.activity_description}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Section: {demand.section_from} – {demand.section_to} (km {demand.start_km} – {demand.end_km})
                  </p>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="font-mono text-xs text-slate-200 font-semibold">
                    {formatMinutesToTime(demand.requested_start_minutes)} – {formatMinutesToTime(demand.requested_end_minutes)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Duration: <span className="text-blue-400 font-mono">{demand.required_minutes}m</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    Trust: {demand.trust_score}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Explainable AI (XAI) Quick Insights */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-200">
                AI Conflict Reasoning (XAI)
              </h3>
            </div>
            <Badge variant="railway" className="text-[10px]">
              CP-SAT
            </Badge>
          </div>

          <div className="space-y-3">
            {MOCK_SOLVER_RESULT.xai.conflict_resolutions.map((res, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-300">
                    {res.block_id}
                  </span>
                  <Badge variant={res.shifted_minutes > 0 ? 'warning' : 'success'} className="text-[10px]">
                    {res.shifted_minutes > 0 ? `+${res.shifted_minutes}m shift` : `${res.shifted_minutes}m shift`}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {res.reason}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Constraint Satisfaction Breakdown
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Train Punctuality Priority</span>
                  <span className="font-mono text-emerald-400">87.6%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[87.6%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Shadow Opportunity Harvest</span>
                  <span className="font-mono text-blue-400">92.0%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[92%]" />
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="railway"
            className="w-full text-xs"
            onClick={() => onNavigate('solver')}
          >
            Launch AI Solver Console
          </Button>
        </div>
      </div>
    </div>
  );
};
