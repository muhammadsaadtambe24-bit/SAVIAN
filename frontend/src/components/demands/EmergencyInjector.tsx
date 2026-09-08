import React, { useState } from 'react';
import { AlertTriangle, Zap, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BlockDemand } from '@/types';
import { cn } from '@/lib/utils';

interface EmergencyTemplate {
  label: string;
  data: Omit<BlockDemand, 'id'>;
}

const EMERGENCY_TEMPLATES: EmergencyTemplate[] = [
  {
    label: 'Rail fracture at KM 183.5 (BKA–MDG)',
    data: {
      demand_code: `EMER-${Date.now().toString(36).toUpperCase()}`,
      source_system: 'TMS',
      department: 'P_WAY',
      section_from: 'BKA',
      section_to: 'ODG',
      start_km: 129.5,
      end_km: 141.0,
      requested_date: new Date().toISOString().slice(0, 10),
      requested_start_minutes: Math.floor((Date.now() % 86400000) / 60000),
      requested_end_minutes: Math.floor((Date.now() % 86400000) / 60000) + 120,
      required_minutes: 120,
      activity_description: 'EMERGENCY: Rail fracture detected at KM 183.5 — immediate welding repair & ultrasonic testing',
      machinery_type: 'Flash Butt Welding',
      machinery_id: 'FBW-E1',
      status: 'PROPOSED',
      trust_score: 100,
      severity_tier: 'CRITICAL',
      priority_weight: 10.0,
      power_block_required: true,
      disconnection_required: true,
      speed_restriction_kmph: 0,
    },
  },
  {
    label: 'OHE mast collapse at KM 108 (SCI)',
    data: {
      demand_code: `EMER-${Date.now().toString(36).toUpperCase()}`,
      source_system: 'SMMS',
      department: 'OHE',
      section_from: 'SCI',
      section_to: 'BPL',
      start_km: 75.4,
      end_km: 92.3,
      requested_date: new Date().toISOString().slice(0, 10),
      requested_start_minutes: Math.floor((Date.now() % 86400000) / 60000),
      requested_end_minutes: Math.floor((Date.now() % 86400000) / 60000) + 180,
      required_minutes: 180,
      activity_description: 'EMERGENCY: OHE mast collapse at KM 108 — structural assessment, temporary bypass, mast replacement',
      machinery_type: 'Breakdown Crane',
      machinery_id: 'BC-140T',
      status: 'PROPOSED',
      trust_score: 100,
      severity_tier: 'CRITICAL',
      priority_weight: 10.0,
      power_block_required: true,
      disconnection_required: true,
      speed_restriction_kmph: 0,
    },
  },
  {
    label: 'Point machine failure at BHS',
    data: {
      demand_code: `EMER-${Date.now().toString(36).toUpperCase()}`,
      source_system: 'TDMS',
      department: 'S_AND_T',
      section_from: 'GLG',
      section_to: 'BHS',
      start_km: 45.7,
      end_km: 61.9,
      requested_date: new Date().toISOString().slice(0, 10),
      requested_start_minutes: Math.floor((Date.now() % 86400000) / 60000),
      requested_end_minutes: Math.floor((Date.now() % 86400000) / 60000) + 90,
      required_minutes: 90,
      activity_description: 'EMERGENCY: Point machine failure at Vidisha (BHS) — interlocking bypass, manual clamping, motor replacement',
      machinery_type: 'Signal Testing Rig',
      machinery_id: 'STR-E2',
      status: 'PROPOSED',
      trust_score: 100,
      severity_tier: 'CRITICAL',
      priority_weight: 10.0,
      power_block_required: false,
      disconnection_required: true,
    },
  },
];

interface EmergencyInjectorProps {
  onInject: (data: Omit<BlockDemand, 'id'>) => Promise<void>;
  onWarmStart: () => void;
  disabled?: boolean;
}

export const EmergencyInjector: React.FC<EmergencyInjectorProps> = ({
  onInject,
  onWarmStart,
  disabled,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('0');
  const [injecting, setInjecting] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  const handleInject = async () => {
    const idx = parseInt(selectedTemplate, 10);
    const template = EMERGENCY_TEMPLATES[idx];
    if (!template) return;

    setInjecting(true);
    setFlashActive(true);

    // Generate a unique code for this injection
    const freshData: Omit<BlockDemand, 'id'> = {
      ...template.data,
      demand_code: `EMER-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      requested_start_minutes: Math.floor((Date.now() % 86400000) / 60000),
      requested_end_minutes:
        Math.floor((Date.now() % 86400000) / 60000) + template.data.required_minutes,
    };

    try {
      await onInject(freshData);
      // Auto-trigger warm-start after injection
      onWarmStart();
    } finally {
      setInjecting(false);
      setTimeout(() => setFlashActive(false), 1200);
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-300 space-y-3',
        flashActive
          ? 'bg-red-950/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
          : 'bg-slate-900/70 border-slate-800',
      )}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <h3 className="text-sm font-bold text-red-300">Emergency Demand Injection</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        {/* Template selector */}
        <div className="flex-1 space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
            Pre-filled Template
          </span>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="bg-slate-950 border-slate-700 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {EMERGENCY_TEMPLATES.map((t, i) => (
                <SelectItem key={i} value={String(i)}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Inject button */}
        <Button
          onClick={handleInject}
          disabled={disabled || injecting}
          className={cn(
            'bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg whitespace-nowrap',
            !disabled && !injecting && 'animate-pulse border-2 border-red-400',
          )}
        >
          {injecting ? (
            <>
              <Zap className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Injecting…
            </>
          ) : (
            <>
              🚨 INJECT EMERGENCY
            </>
          )}
        </Button>
      </div>

      <p className="text-[10px] text-slate-500">
        Creates a CRITICAL demand + auto-triggers warm-start re-solve (3s limit)
      </p>

      {/* Flash overlay */}
      {flashActive && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-red-500/10 animate-ping" style={{ animationDuration: '0.6s', animationIterationCount: 2 }} />
      )}
    </div>
  );
};
