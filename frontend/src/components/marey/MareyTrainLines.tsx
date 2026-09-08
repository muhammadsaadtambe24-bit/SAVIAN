// frontend/src/components/marey/MareyTrainLines.tsx
import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { TrainSchedule, TrainType } from '@/types/marey';

export interface MareyTrainLinesProps {
  trains: TrainSchedule[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  stationMap: Map<string, number>;
  hoveredTrainNumber: string | null;
  onHoverTrain?: (
    train: TrainSchedule | null,
    mousePos?: { x: number; y: number },
    hoveredStation?: {
      station_code: string;
      arrival_minutes: number;
      departure_minutes: number;
      station_km?: number;
    }
  ) => void;
}

const TRAIN_COLORS: Record<TrainType, string> = {
  RAJDHANI: '#ef4444',     // red
  VANDE_BHARAT: '#f97316', // orange
  EXPRESS: '#3b82f6',      // blue
  MAIL: '#8b5cf6',         // purple
  PASSENGER: '#06b6d4',    // cyan
  FREIGHT: '#6b7280',      // gray
};

const BASE_LINE_WIDTHS: Record<TrainType, number> = {
  RAJDHANI: 2.5,
  VANDE_BHARAT: 2.5,
  EXPRESS: 1.8,
  MAIL: 1.8,
  PASSENGER: 1.2,
  FREIGHT: 1.2,
};

interface ComputedTrainPath {
  train: TrainSchedule;
  pathString: string;
  points: { x: number; y: number; station_code: string; arrival: number; departure: number; km: number }[];
  firstPoint: { x: number; y: number; station_code: string };
  lastPoint: { x: number; y: number; station_code: string };
  color: string;
  baseWidth: number;
}

export const MareyTrainLines: React.FC<MareyTrainLinesProps> = ({
  trains,
  xScale,
  yScale,
  stationMap,
  hoveredTrainNumber,
  onHoverTrain,
}) => {
  // Precompute train paths and coordinate points
  const computedPaths: ComputedTrainPath[] = useMemo(() => {
    return trains.map((train) => {
      const color = TRAIN_COLORS[train.train_type] || '#94a3b8';
      const baseWidth = BASE_LINE_WIDTHS[train.train_type] || 1.5;
      const pts: { x: number; y: number; station_code: string; arrival: number; departure: number; km: number }[] = [];

      let d = '';

      train.path.forEach((stop, idx) => {
        const km = stationMap.get(stop.station_code);
        if (km === undefined) return;

        const arrX = xScale(stop.arrival_minutes);
        const y = yScale(km);
        pts.push({ x: arrX, y, station_code: stop.station_code, arrival: stop.arrival_minutes, departure: stop.departure_minutes, km });

        if (idx === 0) {
          d += `M ${arrX},${y}`;
        } else {
          d += ` L ${arrX},${y}`;
        }

        // If dwell time exists (arrival != departure), draw horizontal plateau
        if (stop.departure_minutes > stop.arrival_minutes) {
          const depX = xScale(stop.departure_minutes);
          d += ` L ${depX},${y}`;
          pts.push({ x: depX, y, station_code: stop.station_code, arrival: stop.arrival_minutes, departure: stop.departure_minutes, km });
        }
      });

      const firstPoint = pts[0] || { x: 0, y: 0, station_code: '' };
      const lastPoint = pts[pts.length - 1] || { x: 0, y: 0, station_code: '' };

      return {
        train,
        pathString: d,
        points: pts,
        firstPoint,
        lastPoint,
        color,
        baseWidth,
      };
    });
  }, [trains, xScale, yScale, stationMap]);

  return (
    <g className="marey-train-lines">
      {computedPaths.map((cp) => {
        const isHovered = hoveredTrainNumber === cp.train.train_number;
        const hasActiveHover = hoveredTrainNumber !== null;

        // Opacity logic: when one train is hovered, highlight it and dim all others
        const opacity = isHovered ? 1.0 : hasActiveHover ? 0.15 : 0.88;
        const strokeWidth = isHovered ? cp.baseWidth + 1.8 : cp.baseWidth;

        // Label positioning: start of line
        const isUpTrain = cp.firstPoint.y > cp.lastPoint.y;
        const labelX = cp.firstPoint.x + (isUpTrain ? 4 : 4);
        const labelY = cp.firstPoint.y + (isUpTrain ? 12 : -5);

        return (
          <g
            key={cp.train.train_number}
            className="marey-train-group transition-opacity duration-150"
            style={{ opacity }}
            onMouseEnter={(e) => {
              onHoverTrain?.(cp.train, { x: e.clientX, y: e.clientY });
            }}
            onMouseMove={(e) => {
              onHoverTrain?.(cp.train, { x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => {
              onHoverTrain?.(null);
            }}
          >
            {/* Invisible wide hit area for easy hover on thin lines */}
            <path
              d={cp.pathString}
              fill="none"
              stroke="transparent"
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
            />

            {/* Glowing drop shadow filter when hovered */}
            {isHovered && (
              <path
                d={cp.pathString}
                fill="none"
                stroke={cp.color}
                strokeWidth={strokeWidth + 4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.35}
                pointerEvents="none"
              />
            )}

            {/* Visible Train Polyline */}
            <path
              d={cp.pathString}
              fill="none"
              stroke={cp.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />

            {/* Waypoint dots when line is hovered */}
            {isHovered &&
              cp.points.map((pt, i) => (
                <circle
                  key={`${pt.station_code}-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.departure > pt.arrival ? 3.5 : 2.5}
                  fill={cp.color}
                  stroke="#0f172a"
                  strokeWidth={1.5}
                  pointerEvents="none"
                />
              ))}

            {/* Train Number Label at the start of each line */}
            {cp.pathString && (
              <g pointerEvents="none">
                <text
                  x={labelX}
                  y={labelY}
                  fill={cp.color}
                  fontSize={isHovered ? 10 : 8.5}
                  fontWeight={isHovered ? 'bold' : '600'}
                  fontFamily="monospace"
                  className="select-none tracking-tight"
                  style={{
                    textShadow: '0 0 4px #020617, 0 1px 2px #020617',
                  }}
                >
                  {cp.train.train_number}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
