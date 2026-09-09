import React from 'react';
import { motion } from 'framer-motion';
import {
  Radio,
  Train,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StationNode {
  code: string;
  name: string;
  km: number;
  kavach: 'COMMISSIONED' | 'IN_TRIALS' | 'NOT_EQUIPPED';
}

export const STRIP_STATIONS: StationNode[] = [
  { code: 'BINA', name: 'Bina Jn', km: 0.0, kavach: 'COMMISSIONED' },
  { code: 'KIKA', name: 'Kurwai Kethora', km: 8.4, kavach: 'COMMISSIONED' },
  { code: 'BAQ', name: 'Ganj Basoda', km: 31.1, kavach: 'COMMISSIONED' },
  { code: 'GLG', name: 'Gulabganj', km: 45.7, kavach: 'IN_TRIALS' },
  { code: 'BHS', name: 'Vidisha', km: 61.9, kavach: 'IN_TRIALS' },
  { code: 'SCI', name: 'Sanchi', km: 72.4, kavach: 'COMMISSIONED' },
  { code: 'BPL', name: 'Bhopal Jn', km: 92.2, kavach: 'COMMISSIONED' },
  { code: 'RKMP', name: 'Rani Kamlapati', km: 98.7, kavach: 'COMMISSIONED' },
  { code: 'MDDP', name: 'Mandideep', km: 114.2, kavach: 'IN_TRIALS' },
  { code: 'BKA', name: 'Barkhera (Ghat)', km: 129.5, kavach: 'NOT_EQUIPPED' },
  { code: 'ODG', name: 'Obaidullaganj', km: 141.0, kavach: 'NOT_EQUIPPED' },
  { code: 'ET', name: 'Itarsi Jn', km: 155.4, kavach: 'COMMISSIONED' },
];

export const TrackStripMap: React.FC = () => {
  return (
    <div className="neumorphic-card neumorphic-card-hover rounded-2xl p-5 space-y-4">
      {/* Header with Title and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8e4d8] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold tracking-tight text-stone-900 font-sans">
              BINA – ITARSI SECTION STRIP MAP (152.4 KM)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            West Central Railway • Bhopal Division • Real-time block locations & Kavach safety status
          </p>
        </div>

        {/* Kavach Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span>Commissioned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200" />
            <span>In Trials</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200" />
            <span>Not Equipped</span>
          </div>
        </div>
      </div>

      {/* Schematic Linear Track with animated train translation */}
      <div className="relative pt-12 pb-5 overflow-x-auto">
        <div className="min-w-[850px] relative px-4">
          {/* Main Track Rails */}
          <div className="absolute top-[68px] left-8 right-8 h-1.5 bg-[#dcd6c8] rounded-full shadow-inner" />
          <div className="absolute top-[73px] left-8 right-8 h-0.5 bg-emerald-500/70 rounded-full" />

          {/* Animated Train Marker (Continuous horizontal translation) */}
          <motion.div
            className="absolute top-0 z-20 flex flex-col items-center cursor-pointer pointer-events-none"
            animate={{
              x: ['42%', '48%', '42%'],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Floating Glass Popover Bubble */}
            <div className="mb-1 rounded-2xl border border-[rgba(230,225,215,0.9)] bg-[#ffffff]/95 px-3 py-1.5 text-[10px] shadow-[0_6px_16px_rgba(180,170,155,0.25)] backdrop-blur-md whitespace-nowrap">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <Train className="h-3.5 w-3.5 text-emerald-600" /> 12155 Shaan-e-Bhopal
              </div>
              <div className="text-stone-500 font-mono flex items-center justify-between gap-3 mt-0.5 font-semibold">
                <span>Section: SCI–BPL</span>
                <span className="text-emerald-700 bg-emerald-50 px-1 rounded">Speed: 110 km/h</span>
              </div>
            </div>

            {/* Glowing Train Pin Icon with continuous pulse */}
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.6)] border-2 border-white">
              <Navigation className="h-3.5 w-3.5 rotate-45 text-white" />
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75 pointer-events-none" />
            </div>
          </motion.div>

          {/* Station Nodes Layout */}
          <div className="relative z-10 flex justify-between items-start">
            {STRIP_STATIONS.map((st) => {
              const isCommissioned = st.kavach === 'COMMISSIONED';
              const isTrial = st.kavach === 'IN_TRIALS';

              return (
                <div
                  key={st.code}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  {/* Chainage KM label above */}
                  <span className="text-[10px] font-mono font-semibold text-stone-400 mb-1.5">
                    {st.km}k
                  </span>

                  {/* Station Node Dot */}
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px] font-bold font-mono transition-transform duration-200 group-hover:scale-110 shadow-sm',
                      isCommissioned
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100'
                        : isTrial
                        ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-100'
                        : 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-100'
                    )}
                  >
                    {st.code.slice(0, 3)}
                  </div>

                  {/* Station Code Below */}
                  <span className="text-[11px] font-bold text-stone-800 mt-1.5 font-mono">
                    {st.code}
                  </span>
                  {/* Station Name */}
                  <span className="text-[9px] text-stone-500 max-w-[62px] truncate text-center font-medium">
                    {st.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
