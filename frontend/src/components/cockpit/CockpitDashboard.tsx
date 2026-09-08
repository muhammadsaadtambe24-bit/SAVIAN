import { useState, useCallback } from "react";
import { KPICards } from "@/components/cockpit/KPICards";
import { ChaosOrderToggle } from "@/components/cockpit/ChaosOrderToggle";
import { MareyChart } from "@/components/cockpit/CockpitMareyChart";
import { XAIDrawer } from "@/components/xai/XAIDrawer";
import { Train, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SolverResult, XAIData } from "@/types/cockpit";

interface CockpitDashboardProps {
  solverResult: SolverResult | null;
  chaosResult: SolverResult | null;
  chaosMode: boolean;
  onToggleChaos: () => void;
  onBlockClick: (blockId: string) => void;
  onSolve: (mode: "COLD" | "WARM") => void;
}

export function CockpitDashboard({
  solverResult,
  chaosResult,
  chaosMode,
  onToggleChaos,
  onBlockClick,
  onSolve,
}: CockpitDashboardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleBlockClick = useCallback(
    (blockId: string) => {
      setSelectedBlockId(blockId);
      setDrawerOpen(true);
      onBlockClick(blockId);
    },
    [onBlockClick]
  );

  const activeResult = chaosMode ? chaosResult : solverResult;

  const xaiData: XAIData = solverResult
    ? {
        conflicts: solverResult.conflicts,
        shadows: solverResult.shadows,
        objective: solverResult.objective,
      }
    : { conflicts: [], shadows: [], objective: { train_delay: 0, block_deviation: 0, shadow_bonus: 0, speed_debt: 0, total: 0 } };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Train className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">LINE CLEAR</h1>
              <p className="text-xs text-muted-foreground">
                Operations Cockpit — Block Scheduling AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Solve buttons */}
            <button
              onClick={() => onSolve("COLD")}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                "bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20"
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              Cold Start
            </button>
            <button
              onClick={() => onSolve("WARM")}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              Warm Start
            </button>

            {/* Solve time badge */}
            {activeResult && (
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full tabular-nums">
                {activeResult.solve_time_ms > 0
                  ? `Solved in ${(activeResult.solve_time_ms / 1000).toFixed(1)}s`
                  : "Manual plan"}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Chaos/Order Toggle - centered */}
        <ChaosOrderToggle chaosMode={chaosMode} onToggleChaos={onToggleChaos} />

        {/* KPI Cards */}
        <KPICards
          chaosResult={chaosResult}
          solverResult={solverResult}
          chaosMode={chaosMode}
        />

        {/* Marey Chart */}
        <div
          className={cn(
            "rounded-xl border-2 bg-card p-4 transition-all duration-500",
            chaosMode
              ? "border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
              : "border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
          )}
        >
          <MareyChart
            solverResult={solverResult}
            chaosResult={chaosResult}
            chaosMode={chaosMode}
            onBlockClick={handleBlockClick}
          />
        </div>

        {/* Block list for quick access */}
        {activeResult && (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Block Demands — Click to Explain
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {activeResult.blocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => handleBlockClick(block.id)}
                  className={cn(
                    "text-left px-3 py-2 rounded-lg border transition-all hover:shadow-sm",
                    "hover:border-primary/30 hover:bg-accent",
                    block.priority === "CRITICAL"
                      ? "border-red-500/20 bg-red-500/5"
                      : "border-border"
                  )}
                >
                  <div className="text-xs font-mono font-medium truncate">
                    {block.demand_code}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {block.section}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full",
                        block.priority === "CRITICAL"
                          ? "bg-red-500/10 text-red-500"
                          : block.priority === "HIGH"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {block.priority}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* XAI Drawer */}
      {solverResult && (
        <XAIDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          blockId={selectedBlockId}
          xaiData={xaiData}
          solverResult={solverResult}
        />
      )}
    </div>
  );
}
