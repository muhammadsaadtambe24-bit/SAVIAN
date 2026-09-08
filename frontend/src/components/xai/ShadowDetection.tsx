import { Layers, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShadowMerge } from "@/types/cockpit";

interface ShadowDetectionProps {
  shadows: ShadowMerge[];
}

export function ShadowDetection({ shadows }: ShadowDetectionProps) {
  if (shadows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No shadow merges detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shadows.map((shadow, i) => (
        <div
          key={shadow.id}
          className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-4 animate-counter-up"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-medium text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-full">
              {shadow.merged_section}
            </span>
            <span className="text-xs text-muted-foreground">
              {shadow.hours_saved}h saved
            </span>
          </div>

          {/* Merge visualization */}
          <div className="flex items-center gap-2 py-2">
            {/* Primary block */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md border border-teal-500/30 bg-teal-500/10",
                "animate-merge-in"
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <Layers className="h-4 w-4 text-teal-500" />
              <span className="text-xs font-mono font-medium text-teal-600 dark:text-teal-400">
                {shadow.primary_code.split("/").slice(-1)[0]}
              </span>
            </div>

            {/* Plus sign */}
            <span className="text-muted-foreground text-lg font-light">+</span>

            {/* Shadow block */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md border border-dashed border-teal-500/30 bg-teal-500/5",
                "animate-merge-in"
              )}
              style={{ animationDelay: `${i * 150 + 100}ms` }}
            >
              <Layers className="h-4 w-4 text-teal-400/60" />
              <span className="text-xs font-mono text-teal-500/70">
                {shadow.shadow_code.split("/").slice(-1)[0]}
              </span>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-4 w-4 text-teal-500 mx-1" />

            {/* Merged result */}
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md border-2 border-teal-500 bg-teal-500/15",
                "animate-merge-in"
              )}
              style={{ animationDelay: `${i * 150 + 200}ms` }}
            >
              <Layers className="h-4 w-4 text-teal-500" />
              <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                Merged
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Merged <span className="font-medium text-foreground">{shadow.primary_code}</span>
            {" + "}
            <span className="font-medium text-foreground">{shadow.shadow_code}</span>
            {" → saved "}
            <span className="font-semibold text-teal-500">{shadow.hours_saved}h</span>
            {" mobilization"}
          </p>
        </div>
      ))}

      {/* Total savings */}
      <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-3 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
            Total mobilization saved
          </span>
          <span className="text-lg font-bold text-teal-500">
            {shadows.reduce((acc, s) => acc + s.hours_saved, 0)}h
          </span>
        </div>
      </div>
    </div>
  );
}
