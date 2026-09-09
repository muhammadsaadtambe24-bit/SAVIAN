import React from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Database,
  Save,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* Settings Header */}
      <div className="neumorphic-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800 border border-emerald-300/70 shadow-sm">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight font-sans">
              Corridor & Solver System Configuration
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Bhopal Division (BPL) • West Central Railway (WCR) • Kavach Safety Rules
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-semibold rounded-xl border-[#dcd4c6] bg-white text-stone-700 hover:bg-[#f5f3ec]"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Defaults
          </Button>
          <Button
            variant="railway"
            size="sm"
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-[0_3px_10px_rgba(16,185,129,0.3)]"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Kavach Headway Rules */}
        <div className="neumorphic-card rounded-2xl p-5 space-y-4 bg-[#fbf9f4]">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#e8e2d4]">
            <Shield className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-stone-900 font-sans">
              Kavach Headway & Safety Bounds
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between items-center text-stone-700 font-semibold mb-1">
                <span>Commissioned Kavach Headway Buffer</span>
                <span className="font-mono text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  5 minutes
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                Minimum train following interval when on-board and trackside Kavach RFID tags are active.
              </p>
            </div>

            <div className="pt-2.5 border-t border-[#e8e2d4]">
              <div className="flex justify-between items-center text-stone-700 font-semibold mb-1">
                <span>In-Trials Kavach Headway Buffer</span>
                <span className="font-mono text-sky-800 font-extrabold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  7 minutes
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                Conservative braking margin during field validation trials.
              </p>
            </div>

            <div className="pt-2.5 border-t border-[#e8e2d4]">
              <div className="flex justify-between items-center text-stone-700 font-semibold mb-1">
                <span>Non-Equipped Conventional Signal Spacing</span>
                <span className="font-mono text-amber-800 font-extrabold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  10 minutes
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                Standard double distant / 4-aspect automatic signaling headway.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Solver Objective Weighting */}
        <div className="neumorphic-card rounded-2xl p-5 space-y-4 bg-[#fbf9f4]">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#e8e2d4]">
            <Sliders className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-stone-900 font-sans">
              Solver Multi-Objective Weights
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-stone-700 font-semibold mb-1">
                <span>Train Punctuality Delay Penalty</span>
                <span className="font-mono text-sky-800 font-extrabold">Weight: 10.0</span>
              </div>
              <div className="h-2 w-full bg-[#ede9df] rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-sky-500 rounded-full w-[100%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-700 font-semibold mb-1">
                <span>Block Time Deviation Penalty</span>
                <span className="font-mono text-sky-800 font-extrabold">Weight: 4.5</span>
              </div>
              <div className="h-2 w-full bg-[#ede9df] rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-sky-500 rounded-full w-[45%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-700 font-semibold mb-1">
                <span>Shadow Block Consolidation Bonus</span>
                <span className="font-mono text-emerald-700 font-extrabold">Bonus: +8.0</span>
              </div>
              <div className="h-2 w-full bg-[#ede9df] rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-emerald-500 rounded-full w-[80%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-700 font-semibold mb-1">
                <span>Speed Debt (Permanent PSR Cost)</span>
                <span className="font-mono text-amber-800 font-extrabold">Weight: 6.0</span>
              </div>
              <div className="h-2 w-full bg-[#ede9df] rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-amber-500 rounded-full w-[60%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Data Feeds & Integration Health */}
        <div className="neumorphic-card rounded-2xl p-5 space-y-4 md:col-span-2 bg-[#fbf9f4]">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d4]">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-stone-900 font-sans">
                CRIS & Railway Integration Endpoints
              </h3>
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
              ALL SYSTEMS HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-white/95 border border-stone-200/90 p-3.5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-stone-900">TMS (Track)</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-stone-500 text-[11px] font-medium">Syncing P-Way Demands</p>
              <p className="text-[10px] font-mono text-stone-400 font-semibold">Latency: 18ms</p>
            </div>

            <div className="rounded-xl bg-white/95 border border-stone-200/90 p-3.5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-stone-900">SMMS (OHE)</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-stone-500 text-[11px] font-medium">Traction & Tower Wagons</p>
              <p className="text-[10px] font-mono text-stone-400 font-semibold">Latency: 24ms</p>
            </div>

            <div className="rounded-xl bg-white/95 border border-stone-200/90 p-3.5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-stone-900">TDMS (S&T)</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-stone-500 text-[11px] font-medium">Interlocking & Point Machines</p>
              <p className="text-[10px] font-mono text-stone-400 font-semibold">Latency: 14ms</p>
            </div>

            <div className="rounded-xl bg-white/95 border border-stone-200/90 p-3.5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-stone-900">COA & ICMS</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-stone-500 text-[11px] font-medium">Live Section Train Telemetry</p>
              <p className="text-[10px] font-mono text-stone-400 font-semibold">Latency: 32ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
