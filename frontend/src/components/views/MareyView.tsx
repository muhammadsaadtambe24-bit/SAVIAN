import React, { useState } from 'react';
import { MareyChart } from '@/components/marey/MareyChart';
import { CORRIDOR_STATIONS, MOCK_TRAIN_SCHEDULES, MOCK_MAINTENANCE_BLOCKS } from '@/data/mareyData';
import { formatMinutesToHHMM } from '@/components/marey/MareyTooltip';
import {
  Activity,
  AlertTriangle,
  Layers,
  X,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MareyViewProps {
  chaosMode: boolean;
  onChaosModeChange?: (chaos: boolean) => void;
}

export const MareyView: React.FC<MareyViewProps> = ({
  chaosMode,
  onChaosModeChange,
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = MOCK_MAINTENANCE_BLOCKS.find(
    (b) => b.block_id === selectedBlockId
  );

  const clashingBlocksCount = MOCK_MAINTENANCE_BLOCKS.filter((b) => b.has_clash).length;
  const shadowBlocksCount = MOCK_MAINTENANCE_BLOCKS.filter((b) => b.is_shadow).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner if Chaos Mode Active */}
      {chaosMode && (
        <div className="rounded-xl border border-red-500/40 bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/50 p-4 shadow-lg shadow-red-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-red-500/20 p-2 text-red-400 border border-red-500/30">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-200 flex items-center gap-2">
                  Corridor Conflict Simulation (Chaos Mode Active)
                  <span className="rounded-full bg-red-500/30 px-2 py-0.5 text-[10px] text-red-300 border border-red-500/40">
                    {clashingBlocksCount} Critical Clashes Detected
                  </span>
                </h3>
                <p className="text-xs text-red-300/80">
                  Observe pulsing red borders with glowing shadows on blocks overlapping active train paths (BHS–DWG Passenger conflict & BKA–BNI Ghat OHE conflict).
                </p>
              </div>
            </div>
            {onChaosModeChange && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChaosModeChange(false)}
                className="border-red-500/50 bg-red-900/30 text-red-200 hover:bg-red-800/40 shrink-0"
              >
                Disable Chaos Mode
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Corridor Summary Pills - Matched with Marey Chart Aesthetic */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-700/80 bg-slate-950 p-3.5 shadow-lg shadow-black/20">
          <div className="text-[11px] font-medium text-slate-400">Total Route Span</div>
          <div className="text-xl font-black font-mono text-white mt-1 tracking-tight">231.5 KM</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">BINA Jn (0.0k) → ET Jn (231.5k)</div>
        </div>

        <div className="rounded-xl border border-blue-900/60 bg-slate-950 p-3.5 shadow-lg shadow-black/20">
          <div className="text-[11px] font-medium text-slate-400">Corridor Stations</div>
          <div className="text-xl font-black font-mono text-sky-400 mt-1 tracking-tight">27 Stations</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">26 Contiguous Block Sections</div>
        </div>

        <div className="rounded-xl border border-emerald-900/60 bg-slate-950 p-3.5 shadow-lg shadow-black/20">
          <div className="text-[11px] font-medium text-slate-400">Scheduled Trains</div>
          <div className="text-xl font-black font-mono text-emerald-400 mt-1 tracking-tight">12 Paths</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Rajdhani, VB, Exp, Mail, Freight</div>
        </div>

        <div className="rounded-xl border border-amber-900/60 bg-slate-950 p-3.5 shadow-lg shadow-black/20">
          <div className="text-[11px] font-medium text-slate-400">Maintenance Possessions</div>
          <div className="text-xl font-black font-mono text-amber-400 mt-1 tracking-tight">
            8 Blocks <span className="text-xs font-normal text-slate-400 font-sans">({shadowBlocksCount} shadow)</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">P-Way, OHE, S&T Integrated</div>
        </div>
      </div>

      {/* Primary Marey Chart Component */}
      <MareyChart
        stations={CORRIDOR_STATIONS}
        trains={MOCK_TRAIN_SCHEDULES}
        blocks={MOCK_MAINTENANCE_BLOCKS}
        chaosMode={chaosMode}
        onBlockClick={(blockId: string) => setSelectedBlockId(blockId)}
        height={760}
      />

      {/* Selected Block Inspection Drawer / Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-base font-bold text-white">
                      {selectedBlock.demand_code}
                    </h3>
                    <Badge
                      variant={
                        selectedBlock.department === 'P_WAY'
                          ? 'railway'
                          : selectedBlock.department === 'OHE'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {selectedBlock.department}
                    </Badge>
                  </div>
                  <div className="font-mono text-xs text-slate-400">
                    Block ID: {selectedBlock.block_id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBlockId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="my-4 space-y-3.5 text-xs text-slate-300">
              {/* Clash or Shadow Alerts */}
              {selectedBlock.has_clash && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/60 p-2.5 text-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 animate-pulse" />
                  <div>
                    <span className="font-bold">Schedule Clash Detected:</span> In Chaos Mode, this maintenance possession conflicts with scheduled passenger/freight paths. Optimization solver recommended to shift window by +15 min.
                  </div>
                </div>
              )}

              {selectedBlock.is_shadow && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-2.5 text-emerald-200">
                  <Layers className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Shadow Co-utilization Window:</span> Granted under parent possession{' '}
                    <span className="font-mono text-emerald-300 font-semibold">{selectedBlock.shadow_parent_id}</span>, saving 2.0 hours of track occupation.
                  </div>
                </div>
              )}

              {/* Grid Specs */}
              <div className="grid grid-cols-2 gap-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 p-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Time Window</span>
                  <span className="text-sm font-bold text-amber-300">
                    {formatMinutesToHHMM(selectedBlock.start_minutes)} → {formatMinutesToHHMM(selectedBlock.end_minutes)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Duration: {selectedBlock.end_minutes - selectedBlock.start_minutes} minutes
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Corridor Section</span>
                  <span className="text-sm font-bold text-white">
                    Km {selectedBlock.start_km.toFixed(1)} → {selectedBlock.end_km.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {selectedBlock.section_from && selectedBlock.section_to
                      ? `${selectedBlock.section_from} – ${selectedBlock.section_to}`
                      : 'Main Line Double Track'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Status</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {selectedBlock.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Machinery Assigned</span>
                  <span className="text-xs text-slate-300 truncate block">
                    {selectedBlock.machinery_type || 'Track Crew Unit'}
                  </span>
                </div>
              </div>

              {/* Activity Description */}
              {selectedBlock.activity_description && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">
                    Activity Description:
                  </div>
                  <div className="rounded bg-slate-950/50 p-2.5 text-slate-300 border border-slate-800 text-[11px] leading-relaxed">
                    {selectedBlock.activity_description}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBlockId(null)}
                className="border-slate-700 text-slate-300"
              >
                Close
              </Button>
              <Button
                variant="railway"
                size="sm"
                onClick={() => {
                  alert(`Caution Order T/409 generated for ${selectedBlock.demand_code} at Km ${selectedBlock.start_km} - ${selectedBlock.end_km}`);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Issue T/409 Caution Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
