import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConflictResolution } from "@/types/cockpit";

interface ConflictLogProps {
  conflicts: ConflictResolution[];
}

function severityColor(severity: ConflictResolution["severity"]) {
  switch (severity) {
    case "HIGH":
      return {
        border: "border-l-red-500",
        bg: "bg-red-500/5",
        badge: "bg-red-500/10 text-red-500",
        icon: "text-red-500",
      };
    case "MEDIUM":
      return {
        border: "border-l-amber-500",
        bg: "bg-amber-500/5",
        badge: "bg-amber-500/10 text-amber-500",
        icon: "text-amber-500",
      };
    case "LOW":
      return {
        border: "border-l-emerald-500",
        bg: "bg-emerald-500/5",
        badge: "bg-emerald-500/10 text-emerald-500",
        icon: "text-emerald-500",
      };
  }
}

export function ConflictLog({ conflicts }: ConflictLogProps) {
  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No conflicts to resolve</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conflicts.map((conflict, i) => {
        const colors = severityColor(conflict.severity);
        return (
          <div
            key={conflict.id}
            className={cn(
              "rounded-lg border-l-4 p-4 transition-all",
              colors.border,
              colors.bg,
              "animate-counter-up"
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <ArrowRight className={cn("h-5 w-5 mt-0.5 shrink-0", colors.icon)} />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">
                    Shifted {conflict.demand_code}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    by {conflict.shifted_minutes} min
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      colors.badge
                    )}
                  >
                    {conflict.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {conflict.reason}
                </p>
                <div className="flex gap-4 text-xs text-muted-foreground/70 pt-1">
                  <span>
                    Original:{" "}
                    {new Date(conflict.original_start).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>→</span>
                  <span>
                    New:{" "}
                    {new Date(conflict.new_start).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
