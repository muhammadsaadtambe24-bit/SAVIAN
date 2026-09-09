import React from 'react';
import {
  GitBranch,
  FileCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MOCK_DEMANDS } from '@/data/mockData';
import { formatMinutesToTime } from '@/lib/utils';

export const LifecycleView: React.FC = () => {
  const stages = [
    { key: 'PROPOSED', label: '1. Proposed', desc: 'Depot / Field Input', accent: 'border-stone-300 text-stone-700' },
    { key: 'REVIEWED', label: '2. Reviewed', desc: 'Engineering Branch', accent: 'border-sky-300 text-sky-800' },
    { key: 'APPROVED', label: '3. Approved', desc: 'Sr. DOM / Traffic', accent: 'border-emerald-300 text-emerald-800' },
    { key: 'EXECUTED', label: '4. Executed', desc: 'SM Line-Clear Given', accent: 'border-amber-300 text-amber-800' },
    { key: 'CLOSED', label: '5. Closed', desc: 'Handover & TSR', accent: 'border-purple-300 text-purple-800' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="neumorphic-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800 border border-emerald-300/70 shadow-sm">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight font-sans">
              Indian Railways Block Lifecycle Workflow
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              End-to-End Governance: From Field Depot Proposal to Station Master Line-Clear & Section Closure
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-stone-600 bg-white/80 px-3 py-1.5 rounded-full border border-stone-200/90 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">Syncing with FOIS & ICMS</span>
        </div>
      </div>

      {/* Kanban / Stage Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const items = MOCK_DEMANDS.filter((d) => d.status === stage.key);

          return (
            <div
              key={stage.key}
              className="neumorphic-card rounded-2xl p-3.5 flex flex-col min-h-[440px] bg-[#fbf9f4]"
            >
              {/* Stage Header */}
              <div className="pb-3 border-b border-[#e8e2d4] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-stone-900">
                    {stage.label}
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-[#ede9df] text-stone-700 px-2 py-0.5 rounded-full border border-[#ded6c7]">
                    {items.length}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 font-medium">{stage.desc}</p>
              </div>

              {/* Cards Container */}
              <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                {items.length > 0 ? (
                  items.map((demand) => (
                    <div
                      key={demand.id}
                      className="rounded-xl bg-white/95 border border-stone-200/90 p-3 space-y-2 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs font-black text-stone-900">
                          {demand.demand_code}
                        </span>
                        {/* Pastel Department Pill */}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            demand.department === 'P_WAY'
                              ? 'bg-sky-100/90 text-sky-800 border-sky-300'
                              : demand.department === 'OHE'
                              ? 'bg-amber-100/90 text-amber-800 border-amber-300'
                              : 'bg-indigo-100/90 text-indigo-800 border-indigo-300'
                          }`}
                        >
                          {demand.department}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-700 line-clamp-2 font-medium leading-relaxed">
                        {demand.activity_description}
                      </p>

                      <div className="text-[10px] font-mono text-stone-500 flex justify-between pt-2 border-t border-stone-100 font-medium">
                        <span className="text-stone-700 font-semibold">{demand.section_from}–{demand.section_to}</span>
                        <span className="text-emerald-800 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                          {formatMinutesToTime(demand.requested_start_minutes)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-36 text-center text-stone-400 text-xs">
                    <FileCheck className="h-6 w-6 mb-1 text-stone-300" />
                    <span>No active blocks in {stage.key.toLowerCase()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

