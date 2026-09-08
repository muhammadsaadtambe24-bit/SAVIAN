// frontend/src/components/marey/MareyBlockBands.tsx
import React from 'react';
import * as d3 from 'd3';
import { MaintenanceBlock, BlockDepartment } from '@/types/marey';

export interface MareyBlockBandsProps {
  blocks: MaintenanceBlock[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  chaosMode: boolean;
  onBlockClick: (blockId: string) => void;
  onHoverBlock?: (block: MaintenanceBlock | null, mousePos?: { x: number; y: number }) => void;
}

const DEPARTMENT_COLORS: Record<BlockDepartment, { fill: string; stroke: string }> = {
  P_WAY: { fill: '#f59e0b', stroke: '#d97706' }, // amber
  OHE: { fill: '#3b82f6', stroke: '#2563eb' },   // blue
  S_AND_T: { fill: '#10b981', stroke: '#059669' }, // green
};

export const MareyBlockBands: React.FC<MareyBlockBandsProps> = ({
  blocks,
  xScale,
  yScale,
  chaosMode,
  onBlockClick,
  onHoverBlock,
}) => {
  return (
    <g className="marey-block-bands">
      {/* Embedded SVG styles for pulsing clash animations */}
      <defs>
        <style>{`
          @keyframes marey-clash-pulse {
            0%, 100% {
              stroke: #ef4444;
              stroke-width: 2.5px;
              filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.9));
              opacity: 0.95;
            }
            50% {
              stroke: #ff7878;
              stroke-width: 3.5px;
              filter: drop-shadow(0 0 14px rgba(239, 68, 68, 1));
              opacity: 0.7;
            }
          }
          .animate-marey-clash {
            animation: marey-clash-pulse 1.2s infinite ease-in-out;
          }
        `}</style>
      </defs>

      {blocks.map((block) => {
        const x1 = xScale(Math.min(block.start_minutes, block.end_minutes));
        const x2 = xScale(Math.max(block.start_minutes, block.end_minutes));
        const y1 = yScale(Math.min(block.start_km, block.end_km));
        const y2 = yScale(Math.max(block.start_km, block.end_km));

        const rectX = x1;
        const rectWidth = Math.max(x2 - x1, 4);
        const rectY = y1;
        const rectHeight = Math.max(y2 - y1, 6);

        const deptColor = DEPARTMENT_COLORS[block.department] || { fill: '#64748b', stroke: '#475569' };
        const isClashing = chaosMode && block.has_clash;
        const isShadow = block.is_shadow;

        // Opacity: normal = 0.6, shadow = 0.3
        const fillOpacity = isShadow ? 0.3 : 0.6;
        const strokeColor = isClashing ? '#ef4444' : deptColor.stroke;
        const strokeWidth = isClashing ? 2.5 : isShadow ? 1.5 : 1;
        const strokeDasharray = isShadow && !isClashing ? '4 2' : undefined;

        // Label layout checks
        const showLabel = rectWidth > 38 && rectHeight > 14;
        const showSubLabel = rectWidth > 70 && rectHeight > 30;

        return (
          <g
            key={block.block_id}
            className="marey-block-group cursor-pointer transition-transform duration-100 hover:brightness-110"
            onClick={(e) => {
              e.stopPropagation();
              onBlockClick(block.block_id);
            }}
            onMouseEnter={(e) => {
              onHoverBlock?.(block, { x: e.clientX, y: e.clientY });
            }}
            onMouseMove={(e) => {
              onHoverBlock?.(block, { x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => {
              onHoverBlock?.(null);
            }}
          >
            {/* Maintenance Block Rectangle */}
            <rect
              x={rectX}
              y={rectY}
              width={rectWidth}
              height={rectHeight}
              rx={4}
              ry={4}
              fill={deptColor.fill}
              fillOpacity={fillOpacity}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              className={isClashing ? 'animate-marey-clash' : undefined}
            />

            {/* Shadow Diagonal Hatching or Overlay indicator if shadow */}
            {isShadow && rectWidth > 20 && rectHeight > 10 && (
              <rect
                x={rectX}
                y={rectY}
                width={rectWidth}
                height={rectHeight}
                rx={4}
                ry={4}
                fill="none"
                stroke={deptColor.stroke}
                strokeWidth={1}
                strokeDasharray="2 3"
                pointerEvents="none"
              />
            )}

            {/* Block Text Label Inside */}
            {showLabel && (
              <g pointerEvents="none">
                <text
                  x={rectX + 6}
                  y={rectY + (showSubLabel ? 12 : Math.min(rectHeight / 2 + 3.5, rectHeight - 4))}
                  fill="#ffffff"
                  fontSize={showSubLabel ? 10 : 9}
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="select-none tracking-tight"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {rectWidth < 70 ? block.demand_code.replace('TMS-2026-', 'T-').replace('SMMS-2026-', 'S-').replace('TDMS-2026-', 'D-') : block.demand_code}
                  {rectWidth > 85 ? ` · ${block.department}` : ''}
                </text>

                {showSubLabel && (
                  <text
                    x={rectX + 6}
                    y={rectY + 24}
                    fill="#e2e8f0"
                    fontSize={8.5}
                    fontFamily="monospace"
                    className="select-none text-slate-300"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
                  >
                    {isClashing ? '⚠️ CLASH' : isShadow ? '🔗 SHADOW' : `Km ${block.start_km}-${block.end_km}`}
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
