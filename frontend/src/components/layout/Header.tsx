import React, { useState } from 'react';
import {
  Menu,
  Bell,
  CheckCircle2,
  Clock,
  Loader2,
  Flame,
  Shield,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type SolverStatusType = 'idle' | 'solving' | 'done';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileSidebar: () => void;
  chaosMode?: boolean;
  onChaosModeChange?: (chaos: boolean) => void;
  chaosToggleSlot?: React.ReactNode;
  solverStatus?: SolverStatusType;
  onRunSolver?: () => void;
  unreadAlertCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenMobileSidebar,
  chaosMode = false,
  onChaosModeChange,
  chaosToggleSlot,
  solverStatus = 'idle',
  unreadAlertCount = 3,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Metallic Pill Badge
  const renderSolverBadge = () => {
    switch (solverStatus) {
      case 'solving':
        return (
          <div className="flex items-center space-x-2 rounded-full border border-amber-300 bg-amber-50/90 px-3.5 py-1 text-xs font-semibold text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),2px_2px_6px_rgba(180,170,155,0.2)] animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
            <span className="tracking-wide font-mono text-[11px]">SOLVING...</span>
          </div>
        );
      case 'done':
        return (
          <div className="flex items-center space-x-2 rounded-full border border-emerald-300 bg-emerald-50/90 px-3.5 py-1 text-xs font-semibold text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),2px_2px_6px_rgba(180,170,155,0.2)]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="tracking-wide font-mono text-[11px]">OPTIMAL</span>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="flex items-center space-x-2 rounded-full border border-[#dcd6c8] bg-[#f2efe6] px-3.5 py-1 text-xs font-semibold text-stone-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),2px_2px_5px_rgba(180,170,155,0.2)]">
            <span className="h-2 w-2 rounded-full bg-stone-400" />
            <span className="tracking-wide font-mono text-[11px]">🔘 SOLVER IDLE</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#e3ded2] bg-[#faf8f3]/90 px-4 backdrop-blur-md sm:px-6 shadow-[0_2px_12px_rgba(180,170,155,0.06)]">
      {/* Left Area: Hamburger + Title */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-xl p-2 text-stone-500 hover:bg-[#ede9df] hover:text-stone-800 lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-base font-bold tracking-tight text-stone-900 sm:text-lg">
              {title}
            </h1>
            {subtitle && (
              <span className="hidden sm:inline-block text-xs text-stone-500 border-l border-[#d8d3c5] pl-2.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Chaos / Order Toggle Slot or Built-in Switch */}
        {chaosToggleSlot ? (
          chaosToggleSlot
        ) : (
          <button
            type="button"
            onClick={() => onChaosModeChange?.(!chaosMode)}
            className={cn(
              'flex items-center space-x-2 rounded-full px-3 py-1 transition-all border text-xs font-semibold shadow-sm',
              chaosMode
                ? 'bg-amber-100/80 border-amber-300 text-amber-900 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-[#f0ece3] border-[#d8d3c5] text-stone-600 hover:bg-[#eae5d9]'
            )}
            title="Toggle Chaos Mode"
          >
            <Flame
              className={cn(
                'h-3.5 w-3.5',
                chaosMode ? 'text-amber-600 animate-pulse' : 'text-stone-400'
              )}
            />
            <span className="font-mono text-[11px] tracking-wide">
              {chaosMode ? 'CHAOS' : 'ORDER'}
            </span>
            <div
              className={cn(
                'w-7 h-4 rounded-full p-0.5 transition-colors duration-200 flex items-center',
                chaosMode ? 'bg-amber-600 justify-end' : 'bg-stone-300 justify-start'
              )}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
            </div>
          </button>
        )}

        {/* Solver Status Capsule */}
        <div id="solver-status-container" className="flex items-center">
          {renderSolverBadge()}
        </div>

        {/* Notification Bell with red unread badge */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-stone-500 transition-colors hover:bg-[#ede9df] hover:text-stone-800 focus:outline-none shadow-sm border border-[#e3ded2] bg-[#fbf9f4]"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#faf8f3] animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#dcd6c8] bg-[#fbf9f4] p-3.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#e6e1d4]">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-800">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Rail Corridor Alerts</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
                  BPL Section
                </Badge>
              </div>

              <div className="mt-2.5 space-y-2 max-h-64 overflow-y-auto pr-1">
                <div className="rounded-xl bg-[#f2efe6] p-2.5 text-xs border border-[#e4decfa0]">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-600" /> P-Way Urgent Demand
                    </span>
                    <span className="text-stone-400 text-[10px]">2m ago</span>
                  </div>
                  <p className="mt-1 text-stone-600 text-[11px] leading-relaxed">
                    TMS-2026-089 requested urgent tamping block at BINA-KIKA km 8.4-12.0.
                  </p>
                </div>

                <div className="rounded-xl bg-[#f2efe6] p-2.5 text-xs border border-[#e4decfa0]">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Shadow Block Opportunity
                    </span>
                    <span className="text-stone-400 text-[10px]">12m ago</span>
                  </div>
                  <p className="mt-1 text-stone-600 text-[11px] leading-relaxed">
                    OHE annual inspection merged into P-Way primary block. Saved 90 min corridor downtime.
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#e6e1d4] flex justify-between items-center text-[10px] text-stone-400">
                <span>Auto-sync with COA & ICMS</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
