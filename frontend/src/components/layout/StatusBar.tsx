import React from 'react';
import {
  Activity,
  Cpu,
  Clock,
  Radio,
  Wifi,
  WifiOff,
  GitCommit,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatusBarProps {
  isConnected?: boolean;
  onToggleConnection?: () => void;
  activeSessionId?: string | null;
  lastSolveTime?: string | null;
  solveDurationSec?: number | null;
  optimalityGap?: number | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isConnected = true,
  onToggleConnection,
  activeSessionId = 'SOLV-2026-BPL-0941',
  lastSolveTime = '19:42:08 IST',
  solveDurationSec = 1.84,
  optimalityGap = 0.0,
}) => {
  return (
    <footer
      id="system-status-bar"
      className="sticky bottom-0 z-30 flex h-8 w-full items-center justify-between border-t border-slate-800 bg-slate-900/90 px-4 text-xs text-slate-400 backdrop-blur-md font-mono select-none"
    >
      {/* Left: Connection Status Indicator */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={onToggleConnection}
          className="flex items-center space-x-2 group focus:outline-none"
          title={isConnected ? 'Connected to Railway Control Hub (Click to test disconnect)' : 'Disconnected (Click to reconnect)'}
        >
          <span className="relative flex h-2.5 w-2.5">
            {isConnected ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 signal-green" />
              </>
            ) : (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 signal-red" />
              </>
            )}
          </span>

          <span
            className={cn(
              'text-[11px] font-semibold tracking-wider transition-colors',
              isConnected ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-rose-400 group-hover:text-rose-300'
            )}
          >
            {isConnected ? 'HUB CONNECTED' : 'OFFLINE'}
          </span>

          {isConnected ? (
            <Wifi className="h-3 w-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          ) : (
            <WifiOff className="h-3 w-3 text-rose-400" />
          )}
        </button>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Corridor Section */}
        <div className="hidden sm:flex items-center space-x-1.5 text-slate-400 text-[11px]">
          <Radio className="h-3 w-3 text-blue-400" />
          <span>WCR/BPL: BINA – ET (152.4 KM)</span>
        </div>
      </div>

      {/* Center: Current Solve Session ID */}
      <div className="flex items-center space-x-2 text-[11px]">
        <div className="flex items-center space-x-1.5 bg-slate-950/70 border border-slate-800 rounded px-2 py-0.5">
          <Cpu className="h-3 w-3 text-blue-400" />
          <span className="text-slate-400 font-sans text-[10px] uppercase">Session:</span>
          {activeSessionId ? (
            <span className="text-blue-300 font-bold tracking-tight">
              {activeSessionId}
            </span>
          ) : (
            <span className="text-slate-500 italic">No Active Session</span>
          )}
        </div>
      </div>

      {/* Right: Last Solve Metrics */}
      <div className="flex items-center space-x-3 text-[11px]">
        {lastSolveTime && (
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Clock className="h-3 w-3 text-slate-500" />
            <span className="hidden md:inline text-slate-500 font-sans text-[10px]">LAST SOLVE:</span>
            <span className="text-slate-300">{lastSolveTime}</span>
            {solveDurationSec !== null && (
              <span className="text-emerald-400 text-[10px]">
                ({solveDurationSec}s)
              </span>
            )}
          </div>
        )}

        {optimalityGap !== null && (
          <div className="hidden lg:flex items-center space-x-1 bg-slate-950/60 border border-slate-800/80 px-1.5 py-0.5 rounded text-[10px] text-slate-400">
            <GitCommit className="h-2.5 w-2.5 text-blue-400" />
            <span>Gap: {optimalityGap.toFixed(2)}%</span>
          </div>
        )}

        <div className="hidden xl:flex items-center space-x-1 text-[10px] text-slate-500">
          <Activity className="h-3 w-3 text-emerald-400" />
          <span>12ms</span>
        </div>
      </div>
    </footer>
  );
};
