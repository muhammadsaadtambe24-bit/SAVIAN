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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export type SolverStatusType = 'idle' | 'solving' | 'done';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileSidebar: () => void;
  // Chaos / Order toggle switch props or custom slot
  chaosMode?: boolean;
  onChaosModeChange?: (chaos: boolean) => void;
  chaosToggleSlot?: React.ReactNode;
  // Solver status
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

  // Status Badge Rendering
  const renderSolverBadge = () => {
    switch (solverStatus) {
      case 'solving':
        return (
          <div className="flex items-center space-x-2 rounded-full border border-amber-500/40 bg-amber-950/60 px-3 py-1 text-xs font-semibold text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
            <span className="tracking-wide">SOLVING...</span>
          </div>
        );
      case 'done':
        return (
          <div className="flex items-center space-x-2 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="tracking-wide">OPTIMAL</span>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="flex items-center space-x-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            <span className="tracking-wide">SOLVER IDLE</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-800/90 bg-slate-900/85 px-4 backdrop-blur-md sm:px-6">
      {/* Left Area: Hamburger + Title */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
              {title}
            </h1>
            {subtitle && (
              <span className="hidden sm:inline-block text-xs text-slate-400 border-l border-slate-700 pl-2">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* Chaos / Order Toggle Slot or Built-in Switch */}
        {chaosToggleSlot ? (
          chaosToggleSlot
        ) : (
          <div
            id="chaos-order-toggle-container"
            className={cn(
              'flex items-center space-x-2.5 rounded-lg px-2.5 py-1 transition-all border',
              chaosMode
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-300'
            )}
            title={chaosMode ? 'Chaos Mode: Simulating Disrupted Corridor' : 'Order Mode: Normal Train Timetable'}
          >
            <div className="flex items-center space-x-1.5 text-xs font-medium">
              {chaosMode ? (
                <>
                  <Flame className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
                  <span className="font-mono text-amber-300 font-semibold tracking-wide hidden sm:inline">
                    CHAOS
                  </span>
                </>
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5 text-blue-400" />
                  <span className="font-mono text-slate-300 font-semibold tracking-wide hidden sm:inline">
                    ORDER
                  </span>
                </>
              )}
            </div>

            <Switch
              id="chaos-order-switch"
              checked={chaosMode}
              onCheckedChange={(checked) => onChaosModeChange?.(checked)}
              className={chaosMode ? 'bg-amber-500' : 'bg-slate-700'}
            />
          </div>
        )}

        {/* Solver Status Badge */}
        <div id="solver-status-container" className="flex items-center">
          {renderSolverBadge()}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-lg z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
                  <Zap className="h-3.5 w-3.5 text-blue-400" />
                  <span>Rail Corridor Alerts</span>
                </div>
                <Badge variant="railway" className="text-[10px]">
                  BPL Section
                </Badge>
              </div>

              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                <div className="rounded-lg bg-slate-950/70 p-2 text-xs border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-medium text-amber-400">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> P-Way Urgent Demand
                    </span>
                    <span className="text-slate-500 text-[10px]">2m ago</span>
                  </div>
                  <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                    TMS-2026-089 requested urgent tamping block at BINA-KIKA km 8.4-12.0.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950/70 p-2 text-xs border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-medium text-emerald-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Shadow Block Opportunity
                    </span>
                    <span className="text-slate-500 text-[10px]">12m ago</span>
                  </div>
                  <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                    OHE annual inspection merged into P-Way primary block. Saved 90 min corridor downtime.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950/70 p-2 text-xs border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-medium text-blue-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Kavach Speed Profile
                    </span>
                    <span className="text-slate-500 text-[10px]">25m ago</span>
                  </div>
                  <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                    Commissioned Kavach zone BPL-HBJ updated deceleration curve for Rajdhani 12002.
                  </p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                <span>Auto-sync with COA & ICMS</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-blue-400 hover:underline"
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
