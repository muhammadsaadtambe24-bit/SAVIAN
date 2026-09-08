import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Cpu,
  GitBranch,
  Settings,
  Train,
  X,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type NavItemKey = 'dashboard' | 'demands' | 'solver' | 'lifecycle' | 'settings';

interface SidebarProps {
  activeNav: NavItemKey;
  onSelectNav: (key: NavItemKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  demandCount?: number;
  activeClashes?: number;
}

interface NavItemConfig {
  key: NavItemKey;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'railway' | 'purple';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  mobileOpen,
  onCloseMobile,
  demandCount = 14,
  activeClashes = 0,
}) => {
  const navItems: NavItemConfig[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      key: 'demands',
      label: 'Demands',
      icon: FileText,
      badge: demandCount > 0 ? demandCount : undefined,
      badgeVariant: 'warning',
    },
    {
      key: 'solver',
      label: 'Solver',
      icon: Cpu,
      badge: activeClashes > 0 ? `${activeClashes} clashes` : 'AI',
      badgeVariant: activeClashes > 0 ? 'destructive' : 'railway',
    },
    {
      key: 'lifecycle',
      label: 'Lifecycle',
      icon: GitBranch,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-800/80 bg-slate-900/95">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.45)] border border-blue-400/30">
              <Train className="h-5 w-5 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-wider text-white font-mono">
                  LINE CLEAR
                </span>
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] tracking-wider uppercase font-semibold text-blue-400/90 font-mono">
                IR Block Scheduling AI
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            onClick={onCloseMobile}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corridor Context Pill */}
        <div className="mx-3 mt-3.5 mb-1 px-3 py-2 rounded-md bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Radio className="h-3 w-3 text-blue-400" />
              BINA – ET SECTION
            </span>
            <span className="font-mono text-blue-400 text-[10px]">WCR / BPL</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>152.4 km • Double Track</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Kavach
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;

            return (
              <button
                key={item.key}
                id={`nav-${item.key}`}
                type="button"
                onClick={() => {
                  onSelectNav(item.key);
                  onCloseMobile();
                }}
                className={cn(
                  'group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border-r-2 border-blue-500 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <Badge
                    variant={isActive ? 'railway' : 'secondary'}
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Diagnostics / Mini Status in Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="rounded-md bg-slate-900/90 border border-slate-800 p-2.5 text-xs">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 font-medium">Solver Engine</span>
              <span className="text-emerald-400 font-mono text-[10px] font-bold">CP-SAT 9.8</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Headway Guard</span>
              <span className="text-blue-400 font-mono text-[10px]">7 min (Normal)</span>
            </div>
          </div>
          <div className="mt-2 text-center text-[10px] text-slate-300 font-mono">
            Indian Railways • AI DSS v1.0
          </div>
        </div>
      </aside>
    </>
  );
};
