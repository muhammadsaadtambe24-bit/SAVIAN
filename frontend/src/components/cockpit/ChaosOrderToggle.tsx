import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ChaosOrderToggleProps {
  chaosMode: boolean;
  onToggleChaos: () => void;
}

export function ChaosOrderToggle({ chaosMode, onToggleChaos }: ChaosOrderToggleProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex items-center gap-4">
        {/* CHAOS label */}
        <div className="flex items-center gap-2 min-w-[100px] justify-end">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all duration-300",
              chaosMode
                ? "bg-red-500 animate-pulse-dot shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                : "bg-red-500/30"
            )}
          />
          <span
            className={cn(
              "text-sm font-bold uppercase tracking-wider transition-colors duration-300",
              chaosMode ? "text-red-500" : "text-muted-foreground/50"
            )}
          >
            CHAOS
          </span>
        </div>

        {/* Toggle switch */}
        <Switch
          checked={!chaosMode}
          onCheckedChange={() => onToggleChaos()}
          className={cn(
            "h-8 w-14 scale-125",
            chaosMode ? "!bg-red-500" : "!bg-emerald-500"
          )}
        />

        {/* LINE CLEAR label */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <span
            className={cn(
              "text-sm font-bold uppercase tracking-wider transition-colors duration-300",
              !chaosMode ? "text-emerald-500" : "text-muted-foreground/50"
            )}
          >
            LINE CLEAR
          </span>
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all duration-300",
              !chaosMode
                ? "bg-emerald-500 animate-pulse-dot shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                : "bg-emerald-500/30"
            )}
          />
        </div>
      </div>

      {/* Subtitle */}
      <p
        className={cn(
          "text-xs font-medium tracking-wide transition-colors duration-500",
          chaosMode ? "text-red-400/80" : "text-emerald-400/80"
        )}
      >
        {chaosMode
          ? "Decentralized BDMS-style scheduling"
          : "CP-SAT optimized arbitration"}
      </p>
    </div>
  );
}
