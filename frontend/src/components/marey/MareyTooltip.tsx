// frontend/src/components/marey/MareyTooltip.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { TooltipEntity } from '@/types/marey';
import { Train, Layers, Clock, MapPin, Wrench, AlertTriangle } from 'lucide-react';

export interface MareyTooltipProps {
  entity: TooltipEntity | null;
  position: { x: number; y: number } | null;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const formatMinutesToHHMM = (minutes: number): string => {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(norm / 60);
  const mins = Math.floor(norm % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const TRAIN_TYPE_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  RAJDHANI: { bg: 'bg-red-500/20 border-red-500/40', text: 'text-red-400', label: 'Rajdhani Exp' },
  VANDE_BHARAT: { bg: 'bg-orange-500/20 border-orange-500/40', text: 'text-orange-400', label: 'Vande Bharat' },
  EXPRESS: { bg: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-400', label: 'Express' },
  MAIL: { bg: 'bg-purple-500/20 border-purple-500/40', text: 'text-purple-400', label: 'Superfast Mail' },
  PASSENGER: { bg: 'bg-cyan-500/20 border-cyan-500/40', text: 'text-cyan-400', label: 'Passenger MEMU' },
  FREIGHT: { bg: 'bg-slate-600/30 border-slate-500/40', text: 'text-slate-300', label: 'Freight Rake' },
};

const DEPT_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  P_WAY: { bg: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-400', label: 'P-Way (Track)' },
  OHE: { bg: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-400', label: 'OHE (25kV)' },
  S_AND_T: { bg: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-400', label: 'S&T (Signals)' },
};

export const MareyTooltip: React.FC<MareyTooltipProps> = ({
  entity,
  position,
}) => {
  if (!entity || !position || typeof document === 'undefined') return null;

  const tooltipWidth = 288;
  const tooltipHeight = 200;

  const viewportWidth = window.innerWidth || 1280;
  const viewportHeight = window.innerHeight || 800;

  // Compute clamped position relative to viewport
  let left = position.x + 16;
  let top = position.y + 16;

  // Clamp right edge
  if (left + tooltipWidth > viewportWidth - 16) {
    left = position.x - tooltipWidth - 16;
  }
  if (left < 16) left = 16;

  // Clamp bottom edge
  if (top + tooltipHeight > viewportHeight - 16) {
    top = position.y - tooltipHeight - 16;
  }
  if (top < 16) top = 16;

  const content = (
    <div
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 999999,
        pointerEvents: 'none',
      }}
      className="w-72 rounded-xl border border-slate-700/90 bg-slate-900/95 p-3.5 text-xs text-slate-200 shadow-2xl backdrop-blur-md transition-none"
    >
      {entity.type === 'train' && (
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-blue-400">
                <Train className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-black tracking-wide text-white">
                    {entity.train.train_number}
                  </span>
                  {entity.train.direction && (
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
                      {entity.train.direction}
                    </span>
                  )}
                </div>
                <h4 className="text-[11px] font-medium text-slate-300 line-clamp-1 leading-tight">
                  {entity.train.train_name}
                </h4>
              </div>
            </div>
            {TRAIN_TYPE_BADGES[entity.train.train_type] && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0 ${
                  TRAIN_TYPE_BADGES[entity.train.train_type].bg
                } ${TRAIN_TYPE_BADGES[entity.train.train_type].text}`}
              >
                {TRAIN_TYPE_BADGES[entity.train.train_type].label}
              </span>
            )}
          </div>

          {/* Time & Section Details */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Time Window
              </span>
              <span className="font-mono font-bold text-slate-200">
                {formatMinutesToHHMM(entity.train.path[0]?.arrival_minutes ?? 0)} →{' '}
                {formatMinutesToHHMM(
                  entity.train.path[entity.train.path.length - 1]?.departure_minutes ?? 0
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> Route Span
              </span>
              <span className="font-mono font-medium text-slate-300">
                {entity.train.path[0]?.station_code} → {entity.train.path[entity.train.path.length - 1]?.station_code}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Total Corridor Halts</span>
              <span className="font-mono font-medium text-slate-300">
                {entity.train.path.length} halts / waypoints
              </span>
            </div>
          </div>
        </div>
      )}

      {entity.type === 'block' && (
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Wrench className="h-4 w-4" />
              </div>
              <div>
                <span className="font-mono text-xs font-black tracking-wide text-white">
                  {entity.block.demand_code}
                </span>
                <div className="text-[10px] text-slate-400 font-mono">
                  ID: {entity.block.block_id}
                </div>
              </div>
            </div>
            {DEPT_BADGES[entity.block.department] && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0 ${
                  DEPT_BADGES[entity.block.department].bg
                } ${DEPT_BADGES[entity.block.department].text}`}
              >
                {entity.block.department}
              </span>
            )}
          </div>

          {/* Clash Alert banner if in clash */}
          {entity.block.has_clash && (
            <div className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/60 p-2 text-red-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 animate-pulse" />
              <div className="text-[10px] font-semibold leading-tight">
                Schedule Clash Detected: Occupancy overlaps with train path window!
              </div>
            </div>
          )}

          {/* Shadow Notice banner if shadow */}
          {entity.block.is_shadow && (
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-2 text-emerald-300">
              <Layers className="h-4 w-4 shrink-0 text-emerald-400" />
              <div className="text-[10px] leading-tight">
                <span className="font-bold">Shadow Block:</span> Co-utilized corridor possession window
              </div>
            </div>
          )}

          {/* Block Metrics */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Time Window
              </span>
              <span className="font-mono font-bold text-amber-300">
                {formatMinutesToHHMM(entity.block.start_minutes)} → {formatMinutesToHHMM(entity.block.end_minutes)}
                <span className="ml-1 text-[10px] font-normal text-slate-400">
                  ({entity.block.end_minutes - entity.block.start_minutes}m)
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> Section Chainage
              </span>
              <span className="font-mono font-medium text-slate-200">
                Km {entity.block.start_km.toFixed(1)} → {entity.block.end_km.toFixed(1)}
                <span className="ml-1 text-[10px] text-slate-400">
                  ({Math.abs(entity.block.end_km - entity.block.start_km).toFixed(1)} km)
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Status</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  entity.block.status === 'GRANTED'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : entity.block.status === 'SHADOW'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {entity.block.status}
              </span>
            </div>
          </div>

          {/* Activity Description */}
          {entity.block.activity_description && (
            <p className="border-t border-slate-800 pt-2 text-[10px] text-slate-400 line-clamp-2">
              {entity.block.activity_description}
            </p>
          )}

          <div className="text-[10px] text-blue-400/80 italic text-right pt-0.5">
            Click block to view details & permit
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
};
