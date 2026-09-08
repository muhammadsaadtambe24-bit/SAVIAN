import React from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Database,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* Settings Header */}
      <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-blue-600/20 p-2 text-blue-400 border border-blue-500/30">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Corridor & Solver System Configuration
            </h2>
            <p className="text-xs text-slate-400">
              Bhopal Division (BPL) • West Central Railway (WCR) • Kavach Safety Rules
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="text-xs">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Defaults
          </Button>
          <Button variant="railway" size="sm" className="text-xs">
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Kavach Headway Rules */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Shield className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Kavach Headway & Safety Bounds
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span>Commissioned Kavach Headway Buffer</span>
                <span className="font-mono text-emerald-400 font-bold">5 minutes</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Minimum train following interval when on-board and trackside Kavach RFID tags are active.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span>In-Trials Kavach Headway Buffer</span>
                <span className="font-mono text-sky-400 font-bold">7 minutes</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Conservative braking margin during field validation trials.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-slate-300 mb-1">
                <span>Non-Equipped Conventional Signal Spacing</span>
                <span className="font-mono text-amber-400 font-bold">10 minutes</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Standard double distant / 4-aspect automatic signaling headway.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Solver Objective Weighting */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Sliders className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              Solver Multi-Objective Weights
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Train Punctuality Delay Penalty</span>
                <span className="font-mono text-blue-400 font-bold">Weight: 10.0</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[100%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Block Time Deviation Penalty</span>
                <span className="font-mono text-blue-400 font-bold">Weight: 4.5</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[45%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Shadow Block Consolidation Bonus</span>
                <span className="font-mono text-emerald-400 font-bold">Bonus: +8.0</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[80%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Speed Debt (Permanent PSR Cost)</span>
                <span className="font-mono text-amber-400 font-bold">Weight: 6.0</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[60%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Data Feeds & Integration Health */}
        <div className="glass-panel rounded-xl p-5 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                CRIS & Railway Integration Endpoints
              </h3>
            </div>
            <Badge variant="success" className="text-[10px]">
              ALL SYSTEMS HEALTHY
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-400">TMS (Track)</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 signal-green" />
              </div>
              <p className="text-slate-400 text-[11px]">Syncing P-Way Demands</p>
              <p className="text-[10px] font-mono text-slate-500">Latency: 18ms</p>
            </div>

            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-400">SMMS (OHE)</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 signal-green" />
              </div>
              <p className="text-slate-400 text-[11px]">Traction & Power Blocks</p>
              <p className="text-[10px] font-mono text-slate-500">Latency: 22ms</p>
            </div>

            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sky-400">TDMS (S&T)</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 signal-green" />
              </div>
              <p className="text-slate-400 text-[11px]">Interlocking & Point Machines</p>
              <p className="text-[10px] font-mono text-slate-500">Latency: 14ms</p>
            </div>

            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-400">COA & ICMS</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 signal-green" />
              </div>
              <p className="text-slate-400 text-[11px]">Live Train Positions & Slots</p>
              <p className="text-[10px] font-mono text-slate-500">Latency: 9ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
