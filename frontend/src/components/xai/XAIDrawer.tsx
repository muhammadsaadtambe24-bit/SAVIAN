import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ConflictLog } from "@/components/xai/ConflictLog";
import { ShadowDetection } from "@/components/xai/ShadowDetection";
import { ConstraintWaterfall } from "@/components/xai/ConstraintWaterfall";
import { Swords, Layers, BarChart3 } from "lucide-react";
import type { XAIData, SolverResult } from "@/types/cockpit";

interface XAIDrawerProps {
  open: boolean;
  onClose: () => void;
  blockId: string | null;
  xaiData: XAIData;
  solverResult: SolverResult;
}

export function XAIDrawer({
  open,
  onClose,
  blockId,
  xaiData,
  solverResult,
}: XAIDrawerProps) {
  const [activeTab, setActiveTab] = useState("conflicts");

  // Find the block to display demand_code
  const block = blockId
    ? solverResult.blocks.find((b) => b.id === blockId)
    : null;

  const demandCode = block?.demand_code ?? blockId ?? "—";

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[480px] max-w-[95vw] overflow-y-auto" side="right">
        <SheetClose onClick={onClose} />

        <SheetHeader className="pr-8">
          <SheetTitle className="flex items-center gap-2">
            <span className="text-muted-foreground font-normal">Explainability —</span>
            <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
              {demandCode}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="conflicts" className="flex-1 gap-1.5">
                <Swords className="h-3.5 w-3.5" />
                Conflicts
              </TabsTrigger>
              <TabsTrigger value="shadows" className="flex-1 gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Shadows
              </TabsTrigger>
              <TabsTrigger value="attribution" className="flex-1 gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Attribution
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conflicts" className="mt-4">
              <ConflictLog
                conflicts={
                  blockId
                    ? xaiData.conflicts.filter(
                        (c) =>
                          c.demand_code === demandCode ||
                          c.id === blockId
                      )
                    : xaiData.conflicts
                }
              />
            </TabsContent>

            <TabsContent value="shadows" className="mt-4">
              <ShadowDetection
                shadows={
                  blockId
                    ? xaiData.shadows.filter(
                        (s) =>
                          s.primary_code === demandCode ||
                          s.shadow_code === demandCode
                      )
                    : xaiData.shadows
                }
              />
            </TabsContent>

            <TabsContent value="attribution" className="mt-4">
              <ConstraintWaterfall objective={xaiData.objective} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
