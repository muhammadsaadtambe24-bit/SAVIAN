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
    { key: 'PROPOSED', label: '1. Proposed', desc: 'Depot / Field Input', color: 'border-slate-700 bg-slate-900/80 text-slate-300' },
    { key: 'REVIEWED', label: '2. Reviewed', desc: 'Engineering Branch', color: 'border-blue-500/40 bg-blue-950/30 text-blue-300' },
    { key: 'APPROVED', label: '3. Approved', desc: 'Sr. DOM / Traffic', color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' },
    { key: 'EXECUTED', label: '4. Executed', desc: 'SM SAVIAN Given', color: 'border-amber-500/40 bg-amber-950/30 text-amber-300' },
    { key: 'CLOSED', label: '5. Closed', desc: 'Handover & TSR', color: 'border-purple-500/40 bg-purple-950/30 text-purple-300' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-blue-600/20 p-2 text-blue-400 border border-blue-500/30">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Indian Railways Block Lifecycle Workflow
            </h2>
            <p className="text-xs text-slate-400">
              End-to-End Governance: From Field Depot Proposal to Station Master SAVIAN & Section Closure
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Syncing with FOIS & ICMS</span>
        </div>
      </div>

      {/* Kanban / Stage Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const items = MOCK_DEMANDS.filter((d) => d.status === stage.key);

          return (
            <div
              key={stage.key}
              className="glass-panel rounded-xl p-3 flex flex-col min-h-[420px]"
            >
              {/* Stage Header */}
              <div className="pb-3 border-b border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-200">
                    {stage.label}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {items.length}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500">{stage.desc}</p>
              </div>

              {/* Cards Container */}
              <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                {items.length > 0 ? (
                  items.map((demand) => (
                    <div
                      key={demand.id}
                      className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex justify-between items-start">
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
                          className="text-[9px] px-1.5 py-0"
                        >
                          {demand.department}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        {demand.activity_description}
                      </p>

                      <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-1 border-t border-slate-800/80">
                        <span>{demand.section_from}–{demand.section_to}</span>
                        <span className="text-blue-300">
                          {formatMinutesToTime(demand.requested_start_minutes)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center text-slate-600 text-xs">
                    <FileCheck className="h-6 w-6 mb-1 text-slate-700" />
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
