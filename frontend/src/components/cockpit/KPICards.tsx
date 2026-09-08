import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import {
  AlertTriangle,
  Shield,
  Layers,
  Moon,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SolverResult } from "@/types/cockpit";

interface KPICardsProps {
  chaosResult: SolverResult | null;
  solverResult: SolverResult | null;
  chaosMode: boolean;
}

function AnimatedCounter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;

    if (from === to) return;

    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return (
    <span className={cn("animate-counter-up tabular-nums", className)}>
      {display}
      {suffix}
    </span>
  );
}

function ProgressBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  return (
    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mt-2">
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export function KPICards({ chaosResult, solverResult, chaosMode }: KPICardsProps) {
  const chaos = chaosResult;
  const solver = solverResult;

  const cards = [
    {
      title: "Physical Clashes",
      icon: AlertTriangle,
      manualValue: chaos?.physical_clashes ?? 3,
      clearValue: solver?.physical_clashes ?? 0,
      manualColor: "text-red-500",
      clearColor: "text-emerald-500",
      bgAccent: chaosMode ? "border-red-500/30 bg-red-500/5" : "border-emerald-500/30 bg-emerald-500/5",
      iconColor: chaosMode ? "text-red-500" : "text-emerald-500",
      type: "counter" as const,
    },
    {
      title: "Critical-Defect SLA",
      icon: Shield,
      manualValue: chaos?.sla_percentage ?? 83,
      clearValue: solver?.sla_percentage ?? 100,
      manualColor: "text-amber-500",
      clearColor: "text-emerald-500",
      bgAccent: chaosMode ? "border-amber-500/30 bg-amber-500/5" : "border-emerald-500/30 bg-emerald-500/5",
      iconColor: chaosMode ? "text-amber-500" : "text-emerald-500",
      type: "progress" as const,
      progressColor: chaosMode ? "bg-amber-500" : "bg-emerald-500",
    },
    {
      title: "Shadow-Block Merges",
      icon: Layers,
      manualValue: 0,
      clearValue: solver?.shadows.length ?? 3,
      clearHoursSaved: solver?.shadows.reduce((acc, s) => acc + s.hours_saved, 0) ?? 7,
      manualColor: "text-muted-foreground",
      clearColor: "text-teal-500",
      bgAccent: "border-teal-500/30 bg-teal-500/5",
      iconColor: "text-teal-500",
      type: "merges" as const,
    },
    {
      title: "Corridor-Nights",
      icon: Moon,
      manualValue: chaos?.corridor_nights ?? 7,
      clearValue: solver?.corridor_nights ?? 8,
      manualColor: "text-muted-foreground",
      clearColor: "text-blue-500",
      bgAccent: chaosMode ? "border-muted bg-muted/50" : "border-blue-500/30 bg-blue-500/5",
      iconColor: chaosMode ? "text-muted-foreground" : "text-blue-500",
      type: "nights" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const activeValue = chaosMode ? card.manualValue : card.clearValue;
        const activeColor = chaosMode ? card.manualColor : card.clearColor;

        return (
          <Card
            key={card.title}
            className={cn(
              "transition-all duration-500 border-2",
              card.bgAccent
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={cn("h-5 w-5", card.iconColor)} />
              </div>
            </CardHeader>
            <CardContent>
              {card.type === "counter" && (
                <div className="space-y-1">
                  <AnimatedCounter
                    value={activeValue}
                    className={cn("text-4xl font-bold", activeColor)}
                  />
                  <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                    <span className={cn(chaosMode ? "font-semibold text-red-400" : "")}>
                      Manual: {card.manualValue}
                    </span>
                    <span className="text-muted-foreground/40">|</span>
                    <span className={cn(!chaosMode ? "font-semibold text-emerald-400" : "")}>
                      SAVIAN: {card.clearValue}
                    </span>
                  </div>
                </div>
              )}

              {card.type === "progress" && (
                <div className="space-y-1">
                  <AnimatedCounter
                    value={activeValue}
                    suffix="%"
                    className={cn("text-4xl font-bold", activeColor)}
                  />
                  <ProgressBar value={activeValue} color={card.progressColor!} />
                  <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                    <span className={cn(chaosMode ? "font-semibold text-amber-400" : "")}>
                      Manual: {card.manualValue}%
                    </span>
                    <span className="text-muted-foreground/40">|</span>
                    <span className={cn(!chaosMode ? "font-semibold text-emerald-400" : "")}>
                      SAVIAN: {card.clearValue}%
                    </span>
                  </div>
                </div>
              )}

              {card.type === "merges" && (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <AnimatedCounter
                      value={chaosMode ? 0 : card.clearValue}
                      className={cn("text-4xl font-bold", chaosMode ? "text-muted-foreground" : "text-teal-500")}
                    />
                    <span className="text-sm text-teal-500/80">
                      {!chaosMode && `${(card as typeof cards[2]).clearHoursSaved}h saved`}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {chaosMode
                      ? "No shadow optimization in manual scheduling"
                      : "Automated shadow-block detection & merge"}
                  </div>
                </div>
              )}

              {card.type === "nights" && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AnimatedCounter
                      value={activeValue}
                      className={cn("text-4xl font-bold", activeColor)}
                    />
                    {!chaosMode && (
                      <Tooltip content="One extra night because manual plan had an undetected clash that required rework.">
                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                    <span className={cn(chaosMode ? "font-semibold" : "")}>
                      Manual: {card.manualValue}
                    </span>
                    <span className="text-muted-foreground/40">|</span>
                    <span className={cn(!chaosMode ? "font-semibold text-blue-400" : "")}>
                      SAVIAN: {card.clearValue}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
