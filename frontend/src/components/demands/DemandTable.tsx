import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  PowerOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BlockDemand } from '@/types';
import { cn, minutesToTime, DEPARTMENT_CONFIG, SEVERITY_CONFIG } from '@/lib/utils';

type SortField = 'demand_code' | 'department' | 'section_from' | 'requested_start_minutes' | 'required_minutes' | 'status' | 'severity_tier' | 'trust_score';
type SortDir = 'asc' | 'desc';

interface DemandTableProps {
  demands: BlockDemand[];
  isLoading: boolean;
  onEdit: (demand: BlockDemand) => void;
  onDelete: (id: number) => void;
  onRowClick?: (demand: BlockDemand) => void;
}

const DEPT_BORDER: Record<string, string> = {
  P_WAY: 'border-l-amber-500',
  OHE: 'border-l-blue-500',
  S_AND_T: 'border-l-emerald-500',
};

const STATUS_STYLES: Record<string, string> = {
  PROPOSED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  REVIEWED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  APPROVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  EXECUTED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  CLOSED: 'bg-slate-600/20 text-slate-500 border-slate-600/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const DemandTable: React.FC<DemandTableProps> = ({
  demands,
  isLoading,
  onEdit,
  onDelete,
  onRowClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('demand_code');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="ml-1 h-3 w-3 text-blue-400" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3 text-blue-400" />
    );
  };

  const filtered = useMemo(() => {
    let list = [...demands];

    // Department filter
    if (deptFilter !== 'ALL') {
      list = list.filter((d) => d.department === deptFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter((d) => d.status === statusFilter);
    }

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.demand_code.toLowerCase().includes(q) ||
          d.activity_description.toLowerCase().includes(q) ||
          d.section_from.toLowerCase().includes(q) ||
          d.section_to.toLowerCase().includes(q),
      );
    }

    // Sort
    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [demands, deptFilter, statusFilter, searchQuery, sortField, sortDir]);

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter demands…"
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Dept pills */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          {['ALL', 'P_WAY', 'OHE', 'S_AND_T'].map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setDeptFilter(dept)}
              className={cn(
                'px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all',
                deptFilter === dept
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              {dept === 'P_WAY' ? 'P-Way' : dept === 'S_AND_T' ? 'S&T' : dept === 'ALL' ? 'All' : dept}
            </button>
          ))}
        </div>

        {/* Status pills */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          {['ALL', 'PROPOSED', 'APPROVED', 'EXECUTED'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-2 py-1 text-[10px] font-semibold rounded-md transition-all',
                statusFilter === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 bg-slate-900/90 hover:bg-slate-900/90">
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 w-[130px]">
                <button type="button" className="flex items-center" onClick={() => toggleSort('demand_code')}>
                  Demand Code <SortIcon field="demand_code" />
                </button>
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 w-[80px]">
                <button type="button" className="flex items-center" onClick={() => toggleSort('department')}>
                  Dept <SortIcon field="department" />
                </button>
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 w-[130px]">Section</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 w-[120px]">
                <button type="button" className="flex items-center" onClick={() => toggleSort('requested_start_minutes')}>
                  Time Window <SortIcon field="requested_start_minutes" />
                </button>
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 w-[70px]">
                <button type="button" className="flex items-center" onClick={() => toggleSort('required_minutes')}>
                  Duration <SortIcon field="required_minutes" />
                </button>
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 w-[80px]">
                <button type="button" className="flex items-center" onClick={() => toggleSort('status')}>
                  Status <SortIcon field="status" />
                </button>
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 w-[80px]">
                <button type="button" className="flex items-center" onClick={() => toggleSort('severity_tier')}>
                  Severity <SortIcon field="severity_tier" />
                </button>
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 w-[100px]">
                <button type="button" className="flex items-center" onClick={() => toggleSort('trust_score')}>
                  Trust <SortIcon field="trust_score" />
                </button>
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-slate-500 w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500 text-xs">
                  Loading demands…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500 text-xs">
                  No demands match the current filters
                </TableCell>
              </TableRow>
            )}
            {filtered.map((demand) => {
              const deptCfg = DEPARTMENT_CONFIG[demand.department];
              const sevCfg = SEVERITY_CONFIG[demand.severity_tier];
              const borderColor = DEPT_BORDER[demand.department] || '';

              return (
                <TableRow
                  key={demand.id}
                  className={cn(
                    'border-slate-800/60 cursor-pointer hover:bg-slate-800/40 border-l-2',
                    borderColor,
                  )}
                  onClick={() => onRowClick?.(demand)}
                >
                  {/* Demand Code */}
                  <TableCell className="font-mono text-xs font-bold text-white">
                    {demand.demand_code}
                  </TableCell>

                  {/* Department */}
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
                        deptCfg.bgClass,
                      )}
                    >
                      {deptCfg.label}
                    </span>
                  </TableCell>

                  {/* Section */}
                  <TableCell className="font-mono text-[11px] text-blue-400">
                    {demand.section_from} → {demand.section_to}
                  </TableCell>

                  {/* Time Window */}
                  <TableCell className="font-mono text-[11px] text-slate-200">
                    {minutesToTime(demand.requested_start_minutes)} – {minutesToTime(demand.requested_end_minutes)}
                  </TableCell>

                  {/* Duration */}
                  <TableCell className="font-mono text-[11px] text-slate-300">
                    {demand.required_minutes}m
                    {demand.power_block_required && (
                      <PowerOff className="inline ml-1 h-3 w-3 text-amber-400" />
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
                        STATUS_STYLES[demand.status] || STATUS_STYLES.PROPOSED,
                      )}
                    >
                      {demand.status}
                    </span>
                  </TableCell>

                  {/* Severity */}
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
                        sevCfg.bgClass,
                      )}
                    >
                      {sevCfg.label}
                    </span>
                  </TableCell>

                  {/* Trust Score */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            demand.trust_score >= 90
                              ? 'bg-emerald-500'
                              : demand.trust_score >= 70
                              ? 'bg-blue-500'
                              : 'bg-amber-500',
                          )}
                          style={{ width: `${demand.trust_score}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{demand.trust_score}%</span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-blue-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(demand);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(demand.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="text-[10px] text-slate-500 font-mono px-1">
        Showing {filtered.length} of {demands.length} demands
      </div>
    </div>
  );
};
