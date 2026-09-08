import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { TelemetryEvent } from '@/types';
import { SolverStatus } from '@/hooks/useBlockTelemetry';

interface TelemetryChartProps {
  data: TelemetryEvent[];
  solverStatus: SolverStatus;
  width?: number;
  height?: number;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  data,
  solverStatus,
  width = 400,
  height = 200,
}) => {
  const margin = { top: 20, right: 16, bottom: 32, left: 50 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const { xScale, yScale, bestLine, boundLine } = useMemo(() => {
    if (data.length === 0) {
      return {
        xScale: d3.scaleLinear().domain([0, 8]).range([0, innerW]),
        yScale: d3.scaleLinear().domain([0, 400]).range([innerH, 0]),
        bestLine: '',
        boundLine: '',
      };
    }

    const xDomain = [0, Math.max(d3.max(data, (d) => d.time_sec) ?? 8, 1)];
    const allVals = data.flatMap((d) => [d.objective_cost, d.best_bound]);
    const yMin = Math.max(0, (d3.min(allVals) ?? 0) * 0.9);
    const yMax = (d3.max(allVals) ?? 400) * 1.05;

    const xs = d3.scaleLinear().domain(xDomain).range([0, innerW]);
    const ys = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0]);

    const lineGen = d3
      .line<TelemetryEvent>()
      .x((d) => xs(d.time_sec))
      .curve(d3.curveMonotoneX);

    const best = lineGen.y((d) => ys(d.objective_cost))(data) ?? '';
    const bound = lineGen.y((d) => ys(d.best_bound))(data) ?? '';

    return { xScale: xs, yScale: ys, bestLine: best, boundLine: bound };
  }, [data, innerW, innerH]);

  const xTicks = xScale.ticks(5);
  const yTicks = yScale.ticks(4);

  return (
    <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
          Objective Convergence
        </span>
        {solverStatus === 'OPTIMAL' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            ✓ Optimal
          </span>
        )}
        {solverStatus === 'SOLVING' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[10px] font-bold text-blue-400 animate-pulse">
            ● Solving…
          </span>
        )}
      </div>

      <svg width={width} height={height} className="overflow-visible">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <line
              key={`gy-${tick}`}
              x1={0}
              x2={innerW}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="#1e293b"
              strokeDasharray="2,3"
            />
          ))}

          {/* X axis */}
          <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="#334155" />
          {xTicks.map((tick) => (
            <g key={`xt-${tick}`} transform={`translate(${xScale(tick)},${innerH})`}>
              <line y2={4} stroke="#475569" />
              <text
                y={16}
                textAnchor="middle"
                className="fill-slate-500 text-[9px] font-mono"
              >
                {tick}s
              </text>
            </g>
          ))}
          <text
            x={innerW / 2}
            y={innerH + 28}
            textAnchor="middle"
            className="fill-slate-600 text-[8px] font-mono uppercase"
          >
            Wall Time
          </text>

          {/* Y axis */}
          {yTicks.map((tick) => (
            <g key={`yt-${tick}`} transform={`translate(0,${yScale(tick)})`}>
              <line x2={-4} stroke="#475569" />
              <text
                x={-8}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-500 text-[9px] font-mono"
              >
                {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : Math.round(tick)}
              </text>
            </g>
          ))}

          {/* Best Bound line (green dashed) */}
          {boundLine && (
            <path
              d={boundLine}
              fill="none"
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="5,3"
              className="transition-all duration-300"
            />
          )}

          {/* Current Best line (blue solid) */}
          {bestLine && (
            <path
              d={bestLine}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              className="transition-all duration-300"
            />
          )}

          {/* Data points */}
          {data.map((d, i) => (
            <React.Fragment key={i}>
              <circle
                cx={xScale(d.time_sec)}
                cy={yScale(d.objective_cost)}
                r={2.5}
                fill="#3b82f6"
                className="transition-all duration-200"
              />
              <circle
                cx={xScale(d.time_sec)}
                cy={yScale(d.best_bound)}
                r={2}
                fill="#10b981"
                className="transition-all duration-200"
              />
            </React.Fragment>
          ))}

          {/* Convergence marker when optimal */}
          {data.length > 0 && solverStatus === 'OPTIMAL' && (
            <circle
              cx={xScale(data[data.length - 1].time_sec)}
              cy={yScale(data[data.length - 1].objective_cost)}
              r={5}
              fill="none"
              stroke="#10b981"
              strokeWidth={2}
              className="animate-ping"
              style={{ animationDuration: '2s', animationIterationCount: 3 }}
            />
          )}
        </g>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 bg-blue-500 rounded" />
          <span className="text-[9px] text-slate-400 font-mono">Current Best</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 bg-emerald-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #10b981 0px, #10b981 3px, transparent 3px, transparent 5px)' }} />
          <span className="text-[9px] text-slate-400 font-mono">Best Bound</span>
        </div>
      </div>
    </div>
  );
};
