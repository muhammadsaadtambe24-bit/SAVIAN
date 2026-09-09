import React, { useState } from 'react';
import {
  FileText,
  Search,
  PowerOff,
  Plus,
  Clock,
  CheckCircle2,
  ShieldCheck,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neumorphic-card rounded-2xl p-5">
        <div className="flex items-center space-x-3.5">
          <div className="rounded-xl bg-amber-100 p-2.5 text-amber-800 border border-amber-200/70 shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight font-sans">
              Maintenance Block Demands
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Aggregated from TMS (P-Way), SMMS (OHE), and TDMS (S&T) for Bina–Itarsi Section
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filters */}
          <div className="flex bg-[#ede9df] border border-[#dcd4c6] rounded-xl p-1 shadow-inner">
            {['ALL', 'P_WAY', 'OHE', 'S_AND_T'].map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedDept === dept
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {dept === 'P_WAY' ? 'P-Way' : dept === 'S_AND_T' ? 'S&T' : dept}
              </button>
            ))}
          </div>

          <Button
            variant="railway"
            size="sm"
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-[0_3px_10px_rgba(16,185,129,0.3)]"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            New Demand
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by demand code, station, machinery, or activity description..."
          className="w-full rounded-2xl border border-[rgba(225,220,210,0.85)] bg-[#fbf9f4] pl-11 pr-4 py-3 text-xs font-medium text-stone-800 placeholder-stone-400 shadow-[inset_2px_2px_5px_rgba(180,170,155,0.15),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200/50"
        />
      </div>

      {/* Main Demands Grid / Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demands List (2 Columns) */}
        <div className="lg:col-span-2 space-y-3.5">
          {filteredDemands.map((demand) => {
            const isSelected = selectedDemand?.id === demand.id;

            return (
              <div
                key={demand.id}
                onClick={() => setSelectedDemand(demand)}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 ${
                  isSelected
                    ? 'neumorphic-card ring-2 ring-emerald-500/80 shadow-[0_8px_20px_rgba(16,185,129,0.15)] bg-white'
                    : 'neumorphic-card neumorphic-card-hover'
                }`}
              >
                {/* Header Row: ID, Department Pill, Severity Pill, Time Capsule */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-black text-stone-900 tracking-tight">
                      {demand.demand_code}
                    </span>
                    {/* Pastel Category Pill */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        demand.department === 'P_WAY'
                          ? 'bg-sky-100/90 text-sky-800 border-sky-300/80'
                          : demand.department === 'OHE'
                          ? 'bg-amber-100/90 text-amber-800 border-amber-300/80'
                          : 'bg-indigo-100/90 text-indigo-800 border-indigo-300/80'
                      }`}
                    >
                      {demand.department}
                    </span>
                    {/* Pastel Severity Pill */}
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        demand.severity_tier === 'CRITICAL'
                          ? 'bg-rose-100/90 text-rose-700 border-rose-300/80'
                          : demand.severity_tier === 'HIGH'
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {demand.severity_tier}
                    </span>
                  </div>

                  {/* Time Range Capsule Inset */}
                  <div className="self-end sm:self-auto bg-white/95 border border-stone-200/90 px-3 py-1 rounded-full shadow-sm font-mono text-xs font-extrabold text-stone-800">
                    {formatMinutesToTime(demand.requested_start_minutes)} – {formatMinutesToTime(demand.requested_end_minutes)}
                  </div>
                </div>

                {/* Description Body */}
                <p className="mt-2.5 text-xs text-stone-700 font-medium leading-relaxed">
                  {demand.activity_description}
                </p>

                {/* Bottom Row: Section km, Duration & Trust */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#ebe6dc] text-[11px]">
                  <div className="flex items-center space-x-3 text-stone-500 font-medium">
                    <span>
                      Section: <strong className="text-stone-800 font-semibold">{demand.section_from} – {demand.section_to}</strong> (km {demand.start_km} – {demand.end_km})
                    </span>
                    {demand.power_block_required && (
                      <span className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                        <PowerOff className="h-3 w-3" /> Power Block
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 font-mono">
                    <span className="text-stone-500 font-medium">
                      Duration: <strong className="text-stone-800">{demand.required_minutes}m</strong>
                    </span>
                    <span className="text-emerald-700 font-black text-[12px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Trust: {demand.trust_score}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Demand Detail Card (1 Column Inspector) */}
        <div className="neumorphic-card rounded-2xl p-5 space-y-4 h-fit sticky top-20 bg-[#fbf9f4]">
          {selectedDemand ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d4]">
                <div>
                  <h3 className="text-sm font-extrabold text-stone-900 font-mono">
                    {selectedDemand.demand_code}
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">Demand Inspector</span>
                </div>
                <span className="text-[11px] font-bold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-sky-300">
                  {selectedDemand.department}
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-stone-400 uppercase text-[10px] font-extrabold tracking-wider">
                    Activity Description
                  </span>
                  <p className="mt-1 text-stone-800 font-semibold leading-relaxed">
                    {selectedDemand.activity_description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#e8e2d4]">
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-extrabold tracking-wider">
                      Section
                    </span>
                    <p className="font-mono text-stone-800 font-bold">
                      {selectedDemand.section_from} – {selectedDemand.section_to}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-extrabold tracking-wider">
                      Chainage Range
                    </span>
                    <p className="font-mono text-stone-700 font-medium">
                      KM {selectedDemand.start_km} – {selectedDemand.end_km}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#e8e2d4]">
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-extrabold tracking-wider">
                      Requested Slot
                    </span>
                    <p className="font-mono text-emerald-700 font-extrabold">
                      {formatMinutesToTime(selectedDemand.requested_start_minutes)} – {formatMinutesToTime(selectedDemand.requested_end_minutes)}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-extrabold tracking-wider">
                      Duration Required
                    </span>
                    <p className="font-mono text-stone-800 font-bold">
                      {selectedDemand.required_minutes} Minutes
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#e8e2d4]">
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-extrabold tracking-wider">
                      Machinery
                    </span>
                    <p className="text-stone-700 font-medium">
                      {selectedDemand.machinery_type || 'Manual Gang'}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-extrabold tracking-wider">
                      Machine ID
                    </span>
                    <p className="font-mono text-stone-700 font-medium">
                      {selectedDemand.machinery_id || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Historical Trust Score Box */}
                <div className="rounded-xl bg-[#ede9df] p-3.5 border border-[#ded6c7] space-y-2 shadow-inner">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-600 font-medium">Historical Trust Score</span>
                    <span className="font-mono font-black text-emerald-700">
                      {selectedDemand.trust_score}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#dcd4c6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${selectedDemand.trust_score}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    Calculated from past execution adherence, machine readiness, and punctual handover record.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    variant="railway"
                    size="sm"
                    className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                  >
                    Co-align Shadow Window
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold rounded-xl border-[#dcd4c6] bg-white text-stone-700 hover:bg-[#f5f3ec]"
                  >
                    Inspect Safety Clearance
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-stone-400 text-xs font-medium">
              Select a block demand to inspect parameters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

