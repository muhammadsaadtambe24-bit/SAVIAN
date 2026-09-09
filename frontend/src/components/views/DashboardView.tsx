import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Layers,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_DEMANDS, MOCK_SOLVER_RESULT } from '@/data/mockData';
import { formatMinutesToTime } from '@/lib/utils';
import { TrackStripMap } from '@/components/cockpit/TrackStripMap';

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
      {/* Disruption Simulator Banner with smooth drop-down Framer Motion transition & looping amber glow */}
      <AnimatePresence>
        {chaosMode && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-100/90 via-[#fcfbf7] to-amber-50/80 p-4 shadow-[0_6px_20px_rgba(245,158,11,0.18)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="rounded-2xl bg-amber-200/90 p-2.5 text-amber-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] border border-amber-300">
                    <Zap className="h-5 w-5 animate-bounce text-amber-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950 font-sans">
                      Corridor Disruption Simulator Active (Chaos Mode)
                    </h3>
                    <p className="text-xs text-amber-800/90 font-medium">
                      Simulating freight train slowdown, speed restrictions, and sudden P-Way emergency tamping demands.
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 14px rgba(180,83,9,0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRunSolver}
                  disabled={solverStatus === 'solving'}
                  className="inline-flex items-center justify-center text-xs font-bold bg-gradient-to-r from-amber-700 to-amber-800 text-white px-4 py-2 rounded-xl shadow-[0_3px_10px_rgba(180,83,9,0.25)] shrink-0 border border-amber-900/40"
                >
                  <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                  Re-optimize Corridor
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero KPI Cards (4 Grid Columns) - Neumorphic with count-up & hover elevation */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Demands */}
        <motion.div
          whileHover={{ y: -3 }}
          className="neumorphic-card neumorphic-card-hover rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Demands</span>
            <div className="rounded-xl bg-sky-100 p-2 text-sky-700 border border-sky-200/70 shadow-sm">
              <Activity className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black tracking-tight text-stone-900 font-mono">
                  5
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  +3 new today
                </span>
              </div>
              <div className="mt-2 text-[11px] text-stone-500 font-medium">
                Critical: <strong className="text-rose-600">2</strong> &nbsp;Reviewed: <strong>1</strong> &nbsp;Approved: <strong className="text-emerald-700">2</strong>
              </div>
            </div>

            {/* Blue SVG Sparkline */}
            <svg className="w-20 h-10 text-sky-600 overflow-visible" viewBox="0 0 70 30" fill="none">
              <path
                d="M 2 24 Q 18 6, 36 20 T 68 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="68" cy="8" r="3" fill="currentColor" />
            </svg>
          </div>
        </motion.div>

        {/* Card 2: Shadow Block Savings */}
        <motion.div
          whileHover={{ y: -3 }}
          className="neumorphic-card neumorphic-card-hover rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Shadow Block Savings</span>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 border border-emerald-200/70 shadow-sm">
              <Layers className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black tracking-tight text-emerald-800 font-mono">
                  3.5 hrs
                </span>
                <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                  2 Merges
                </span>
              </div>
              <p className="mt-2 text-[11px] text-stone-500 font-medium leading-tight">
                Co-aligning OHE & S&T under P-Way possessions
              </p>
            </div>

            {/* Emerald SVG Sparkline */}
            <svg className="w-20 h-10 text-emerald-600 overflow-visible" viewBox="0 0 70 30" fill="none">
              <path
                d="M 2 26 Q 20 24, 38 12 T 68 4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="68" cy="4" r="3" fill="currentColor" />
            </svg>
          </div>
        </motion.div>

        {/* Card 3: Train Delay Impact */}
        <motion.div
          whileHover={{ y: -3 }}
          className="neumorphic-card neumorphic-card-hover rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Train Delay Impact</span>
            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700 border border-indigo-200/70 shadow-sm">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black tracking-tight text-stone-900 font-mono">
                  5.2 min
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  -62% vs manual
                </span>
              </div>
              <p className="mt-2 text-[11px] text-stone-500 font-medium leading-tight">
                Punctuality preserved across passenger slots
              </p>
            </div>

            {/* Indigo SVG Sparkline */}
            <svg className="w-20 h-10 text-indigo-600 overflow-visible" viewBox="0 0 70 30" fill="none">
              <path
                d="M 2 8 Q 20 26, 38 14 T 68 22"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="68" cy="22" r="3" fill="currentColor" />
            </svg>
          </div>
        </motion.div>

        {/* Card 4: Kavach Commissioned */}
        <motion.div
          whileHover={{ y: -3 }}
          className="neumorphic-card neumorphic-card-hover rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Kavach Commissioned</span>
            <div className="rounded-xl bg-teal-100 p-2 text-teal-700 border border-teal-200/70 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black tracking-tight text-teal-800 font-mono">
                  98.7 km
                </span>
                <span className="text-xs text-stone-400 font-mono font-semibold">
                  / 152.4 km
                </span>
              </div>
              <p className="mt-2 text-[11px] text-stone-500 font-medium leading-tight">
                Dynamic braking model active on 8 stations
              </p>
            </div>

            {/* Teal SVG Sparkline */}
            <svg className="w-20 h-10 text-teal-600 overflow-visible" viewBox="0 0 70 30" fill="none">
              <path
                d="M 2 22 Q 22 4, 42 18 T 68 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="68" cy="8" r="3" fill="currentColor" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Centerpiece: Bina–Itarsi Strip Map */}
      <TrackStripMap />

      {/* Bottom Operational Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card (2/3 width) - Granted Maintenance Blocks */}
        <div className="lg:col-span-2 neumorphic-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e4d8]">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-stone-900 font-sans">
                Granted Maintenance Blocks
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('demands')}
              className="text-xs text-emerald-800 border-[#d8d3c5] hover:bg-emerald-50 rounded-xl font-bold"
            >
              View All Demands ↗
            </Button>
          </div>

          <div className="space-y-3">
            {MOCK_DEMANDS.slice(0, 3).map((demand) => (
              <div
                key={demand.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl neumorphic-inset p-3.5 hover:border-stone-400 transition-all gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-stone-900">
                      {demand.demand_code}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-blue-100 text-blue-900 border-blue-300 font-bold"
                    >
                      {demand.department}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-rose-100 text-rose-900 border-rose-300 font-bold"
                    >
                      {demand.severity_tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-700 font-medium">
                    {demand.activity_description}
                  </p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Section: {demand.section_from} – {demand.section_to} (km {demand.start_km} – {demand.end_km})
                  </p>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#d8d3c5]">
                  <div className="font-mono text-xs text-stone-900 font-bold bg-[#ffffff] px-3 py-1 rounded-lg shadow-sm border border-[#d8d3c5]">
                    {formatMinutesToTime(demand.requested_start_minutes)} – {formatMinutesToTime(demand.requested_end_minutes)}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 font-medium">
                    Duration: <span className="text-stone-800 font-mono font-bold">{demand.required_minutes}m</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono font-bold">
                    Trust: {demand.trust_score}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card (1/3 width) - AI Conflict Reasoning (XAI) */}
        <div className="neumorphic-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e4d8]">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-stone-900 font-sans">
                AI Conflict Reasoning (XAI)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#ede9df] text-stone-700 px-2 py-0.5 rounded-full border border-[#d8d3c5]">
              CP-SAT
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_SOLVER_RESULT.xai.conflict_resolutions.map((res, idx) => (
              <div
                key={idx}
                className="rounded-xl neumorphic-inset p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-stone-900">
                    {res.block_id}
                  </span>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    {res.shifted_minutes > 0 ? `+${res.shifted_minutes}m shift` : `${res.shifted_minutes}m shift`}
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {res.reason}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-2.5">
            <div className="text-xs font-bold text-stone-700">
              Constraint Satisfaction Breakdown
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-stone-600 mb-1 font-semibold">
                  <span>Train Punctuality Priority</span>
                  <span className="font-mono font-bold text-emerald-800">87.6%</span>
                </div>
                <div className="h-2 w-full bg-[#ede9df] rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-emerald-500 rounded-full w-[87.6%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-stone-600 mb-1 font-semibold">
                  <span>Shadow Opportunity Harvest</span>
                  <span className="font-mono font-bold text-sky-800">92.0%</span>
                </div>
                <div className="h-2 w-full bg-[#ede9df] rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-sky-500 rounded-full w-[92%]" />
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full text-xs bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-bold py-2.5"
            onClick={() => onNavigate('solver')}
          >
            Launch AI Solver Console
          </Button>
        </div>
      </div>
    </div>
  );
};
