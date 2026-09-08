import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { SolverResult } from "@/types/cockpit";

interface MareyChartProps {
  solverResult: SolverResult | null;
  chaosMode: boolean;
  chaosResult: SolverResult | null;
  onBlockClick: (blockId: string) => void;
}

const CHART_HEIGHT = 400;
const CHART_PADDING = { top: 30, right: 60, bottom: 40, left: 70 };
const INNER_WIDTH = 900;
const INNER_HEIGHT = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

function timeToHour(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

const blockTypeColors: Record<string, string> = {
  OHE: "#f59e0b",
  TRACK: "#3b82f6",
  SIGNAL: "#8b5cf6",
  GENERAL: "#6b7280",
};

export function MareyChart({
  solverResult,
  chaosMode,
  chaosResult,
  onBlockClick,
}: MareyChartProps) {
  const data = chaosMode ? chaosResult : solverResult;

  const { kmMin, kmMax, hourMin, hourMax } = useMemo(() => {
    if (!data)
      return { kmMin: 0, kmMax: 230, hourMin: 0, hourMax: 6 };

    const allKm = [
      ...data.blocks.flatMap((b) => [b.start_km, b.end_km]),
      ...data.trains.flatMap((t) => t.path_km.map(([km]) => km)),
    ];
    const allHours = [
      ...data.blocks.flatMap((b) => [timeToHour(b.start_time), timeToHour(b.end_time)]),
    ];

    return {
      kmMin: Math.min(...allKm),
      kmMax: Math.max(...allKm),
      hourMin: Math.floor(Math.min(...allHours)),
      hourMax: Math.ceil(Math.max(...allHours)),
    };
  }, [data]);

  const scaleX = (km: number) =>
    CHART_PADDING.left +
    ((km - kmMin) / (kmMax - kmMin || 1)) * INNER_WIDTH;

  const scaleY = (hour: number) =>
    CHART_PADDING.top +
    ((hour - hourMin) / (hourMax - hourMin || 1)) * INNER_HEIGHT;

  // Grid lines
  const hourTicks = [];
  for (let h = hourMin; h <= hourMax; h++) {
    hourTicks.push(h);
  }
  const kmTicks = [0, 55, 110, 145, 190, 230];

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[960px]">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Marey Chart — Time × Distance
          </h3>
          <div className="flex gap-4">
            {Object.entries(blockTypeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground">{type}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-4 bg-foreground/50 rounded" />
              <span className="text-xs text-muted-foreground">Train path</span>
            </div>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${CHART_PADDING.left + INNER_WIDTH + CHART_PADDING.right} ${CHART_HEIGHT}`}
          className="w-full"
          style={{ height: CHART_HEIGHT }}
        >
          {/* Grid lines - horizontal (time) */}
          {hourTicks.map((h) => (
            <g key={`h-${h}`}>
              <line
                x1={CHART_PADDING.left}
                y1={scaleY(h)}
                x2={CHART_PADDING.left + INNER_WIDTH}
                y2={scaleY(h)}
                className="stroke-border"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <text
                x={CHART_PADDING.left - 8}
                y={scaleY(h) + 4}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize={11}
              >
                {String(h % 24).padStart(2, "0")}:00
              </text>
            </g>
          ))}

          {/* Grid lines - vertical (km) */}
          {kmTicks.map((km) => (
            <g key={`km-${km}`}>
              <line
                x1={scaleX(km)}
                y1={CHART_PADDING.top}
                x2={scaleX(km)}
                y2={CHART_PADDING.top + INNER_HEIGHT}
                className="stroke-border"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <text
                x={scaleX(km)}
                y={CHART_PADDING.top + INNER_HEIGHT + 20}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={11}
              >
                {km} km
              </text>
            </g>
          ))}

          {/* Train paths */}
          {data?.trains.map((train) => {
            const points = train.path_km
              .map(([km, hour]) => `${scaleX(km)},${scaleY(hourMin + hour)}`)
              .join(" ");

            return (
              <g key={train.id}>
                <polyline
                  points={points}
                  fill="none"
                  className={cn(
                    "transition-all duration-500",
                    train.delay_minutes > 15
                      ? "stroke-red-400"
                      : train.delay_minutes > 0
                      ? "stroke-amber-400"
                      : "stroke-foreground/40"
                  )}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Train label */}
                {train.path_km.length > 0 && (
                  <text
                    x={scaleX(train.path_km[train.path_km.length - 1][0]) + 4}
                    y={scaleY(hourMin + train.path_km[train.path_km.length - 1][1])}
                    className="fill-muted-foreground"
                    fontSize={9}
                  >
                    {train.train_number}
                    {train.delay_minutes > 0 && ` (+${train.delay_minutes}m)`}
                  </text>
                )}
              </g>
            );
          })}

          {/* Blocks as rectangles */}
          {data?.blocks.map((block) => {
            const x1 = scaleX(block.start_km);
            const x2 = scaleX(block.end_km);
            const y1 = scaleY(timeToHour(block.start_time));
            const y2 = scaleY(timeToHour(block.end_time));
            const color = blockTypeColors[block.block_type] ?? "#6b7280";

            return (
              <g
                key={block.id}
                className="cursor-pointer group"
                onClick={() => onBlockClick(block.id)}
              >
                <rect
                  x={Math.min(x1, x2)}
                  y={Math.min(y1, y2)}
                  width={Math.abs(x2 - x1)}
                  height={Math.abs(y2 - y1)}
                  fill={color}
                  fillOpacity={0.2}
                  stroke={color}
                  strokeWidth={2}
                  rx={4}
                  className="transition-all duration-300 group-hover:fill-opacity-40 group-hover:stroke-[3]"
                />
                {/* Block label */}
                {Math.abs(x2 - x1) > 60 && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 + 3}
                    textAnchor="middle"
                    fill={color}
                    fontSize={9}
                    fontWeight="600"
                    className="pointer-events-none"
                  >
                    {block.demand_code.split("/").pop()}
                  </text>
                )}
                {/* Priority indicator */}
                {block.priority === "CRITICAL" && (
                  <circle
                    cx={Math.min(x1, x2) + 6}
                    cy={Math.min(y1, y2) + 6}
                    r={3}
                    fill="#ef4444"
                    className="animate-pulse-dot"
                  />
                )}
              </g>
            );
          })}

          {/* Clash indicators for chaos mode */}
          {chaosMode &&
            data &&
            data.physical_clashes > 0 &&
            data.blocks.slice(0, 2).map((block, i) => {
              const cx = scaleX((block.start_km + block.end_km) / 2);
              const cy = scaleY(
                (timeToHour(block.start_time) + timeToHour(block.end_time)) / 2
              );
              return (
                <g key={`clash-${i}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={12}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={2}
                    className="animate-pulse-dot"
                  />
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize={12}
                    fontWeight="bold"
                  >
                    ⚡
                  </text>
                </g>
              );
            })}

          {/* Axis labels */}
          <text
            x={CHART_PADDING.left + INNER_WIDTH / 2}
            y={CHART_HEIGHT - 2}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={11}
            fontWeight="500"
          >
            Kilometer Post
          </text>
          <text
            x={14}
            y={CHART_PADDING.top + INNER_HEIGHT / 2}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={11}
            fontWeight="500"
            transform={`rotate(-90, 14, ${CHART_PADDING.top + INNER_HEIGHT / 2})`}
          >
            Time (hours)
          </text>
        </svg>
      </div>
    </div>
  );
}
