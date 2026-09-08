import { cn } from "@/lib/utils";
import type { ObjectiveBreakdown } from "@/types/cockpit";

interface ConstraintWaterfallProps {
  objective: ObjectiveBreakdown;
}

const segments = [
  { key: "train_delay" as const, label: "Train Delay", color: "bg-red-500", textColor: "text-red-500" },
  { key: "block_deviation" as const, label: "Block Deviation", color: "bg-amber-500", textColor: "text-amber-500" },
  { key: "shadow_bonus" as const, label: "Shadow Bonus", color: "bg-emerald-500", textColor: "text-emerald-500" },
  { key: "speed_debt" as const, label: "Speed Debt", color: "bg-purple-500", textColor: "text-purple-500" },
];

export function ConstraintWaterfall({ objective }: ConstraintWaterfallProps) {
  // Calculate absolute sum for proportional widths
  const absSum = segments.reduce(
    (acc, s) => acc + Math.abs(objective[s.key]),
    0
  );

  return (
    <div className="space-y-6">
      {/* Stacked bar */}
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Objective Function Breakdown
        </div>

        <div className="flex h-10 rounded-lg overflow-hidden border border-border">
          {segments.map((seg) => {
            const value = objective[seg.key];
            const absValue = Math.abs(value);
            const pct = absSum > 0 ? (absValue / absSum) * 100 : 25;

            if (pct < 1) return null;

            return (
              <div
                key={seg.key}
                className={cn(
                  "flex items-center justify-center transition-all duration-700 relative group",
                  seg.color,
                  value < 0 ? "opacity-80" : ""
                )}
                style={{ width: `${pct}%` }}
              >
                {pct > 10 && (
                  <span className="text-xs font-bold text-white drop-shadow-sm">
                    {value < 0 ? "" : ""}
                    {Math.round(pct)}%
                  </span>
                )}

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs rounded-md px-2 py-1 shadow-md border whitespace-nowrap z-10 pointer-events-none">
                  {seg.label}: {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {segments.map((seg) => {
          const value = objective[seg.key];
          return (
            <div key={seg.key} className="flex items-center gap-2">
              <div className={cn("h-3 w-3 rounded-sm", seg.color)} />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{seg.label}</span>
                <span className={cn("text-xs font-semibold tabular-nums", seg.textColor)}>
                  {value > 0 ? "+" : ""}
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm font-medium text-muted-foreground">Total Objective</span>
        <span className="text-2xl font-bold tabular-nums">{objective.total}</span>
      </div>
    </div>
  );
}
