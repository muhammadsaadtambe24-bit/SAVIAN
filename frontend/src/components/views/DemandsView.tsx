import React, { useState } from 'react';
import {
  FileText,
  Search,
  PowerOff,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlockDemand } from '@/types';
import { MOCK_DEMANDS } from '@/data/mockData';
import { formatMinutesToTime } from '@/lib/utils';

export const DemandsView: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [demands] = useState<BlockDemand[]>(MOCK_DEMANDS);
  const [selectedDemand, setSelectedDemand] = useState<BlockDemand | null>(MOCK_DEMANDS[0]);

  const filteredDemands = demands.filter((demand) => {
    const matchesDept = selectedDept === 'ALL' || demand.department === selectedDept;
    const matchesSearch =
      demand.demand_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demand.activity_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demand.section_from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demand.section_to.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Maintenance Block Demands
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated from TMS (P-Way), SMMS (OHE), and TDMS (S&T) for Bina–Itarsi Section
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filters */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {['ALL', 'P_WAY', 'OHE', 'S_AND_T'].map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {dept === 'P_WAY' ? 'P-Way' : dept === 'S_AND_T' ? 'S&T' : dept}
              </button>
            ))}
          </div>

          <Button variant="railway" size="sm" className="text-xs">
            <Plus className="mr-1 h-3.5 w-3.5" />
            New Demand
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by demand code, station, machinery, or activity description..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Main Demands Grid / Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demands List (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredDemands.map((demand) => {
            const isSelected = selectedDemand?.id === demand.id;

            return (
              <div
                key={demand.id}
                onClick={() => setSelectedDemand(demand)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'bg-slate-900/95 border-blue-500/60 shadow-[0_0_15px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/40'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-white">
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
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {demand.source_system}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
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
                    <Badge
                      variant={
                        demand.status === 'APPROVED'
                          ? 'success'
                          : demand.status === 'REVIEWED'
                          ? 'info'
                          : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {demand.status}
                    </Badge>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-300 font-medium">
                  {demand.activity_description}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-blue-400">
                      {demand.section_from} → {demand.section_to} (km {demand.start_km}–{demand.end_km})
                    </span>
                    {demand.power_block_required && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <PowerOff className="h-3 w-3" /> Power Block
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 font-mono">
                    <span className="text-slate-200">
                      {formatMinutesToTime(demand.requested_start_minutes)} – {formatMinutesToTime(demand.requested_end_minutes)}
                    </span>
                    <span className="text-blue-400">({demand.required_minutes}m)</span>
                    <span className="text-emerald-400 font-bold">Trust: {demand.trust_score}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Demand Detail Card (1 Column) */}
        <div className="glass-panel rounded-xl p-5 space-y-4 h-fit sticky top-20">
          {selectedDemand ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    {selectedDemand.demand_code}
                  </h3>
                  <span className="text-xs text-slate-400">Demand Inspector</span>
                </div>
                <Badge variant="railway">{selectedDemand.department}</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">
                    Activity Description
                  </span>
                  <p className="mt-1 text-slate-200 font-medium">
                    {selectedDemand.activity_description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">
                      Section
                    </span>
                    <p className="font-mono text-slate-200 font-semibold">
                      {selectedDemand.section_from} – {selectedDemand.section_to}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">
                      Chainage Range
                    </span>
                    <p className="font-mono text-slate-200">
                      KM {selectedDemand.start_km} – {selectedDemand.end_km}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">
                      Requested Slot
                    </span>
                    <p className="font-mono text-blue-400 font-bold">
                      {formatMinutesToTime(selectedDemand.requested_start_minutes)} – {formatMinutesToTime(selectedDemand.requested_end_minutes)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">
                      Duration Required
                    </span>
                    <p className="font-mono text-slate-200 font-semibold">
                      {selectedDemand.required_minutes} Minutes
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">
                      Machinery
                    </span>
                    <p className="text-slate-300">
                      {selectedDemand.machinery_type || 'Manual Gang'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">
                      Machine ID
                    </span>
                    <p className="font-mono text-slate-300">
                      {selectedDemand.machinery_id || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Historical Trust Score</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {selectedDemand.trust_score}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${selectedDemand.trust_score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Calculated from past execution adherence, machine readiness, and punctual handover record.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button variant="railway" size="sm" className="w-full text-xs">
                    Co-align Shadow Window
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Inspect Safety Clearance
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              Select a block demand to inspect parameters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
