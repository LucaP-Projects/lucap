"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAssistantStore } from "@/stores/useAssistantStore";
import { AssistantPanel } from "./assistant-panel";

export function AssistantDrawer() {
  const { isOpen, closeAssistant } = useAssistantStore();
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={closeAssistant}>
      <SheetContent 
        side="right" 
        className={`${isFullScreen ? "w-screen max-w-none" : "w-full sm:max-w-112.5"} p-0 border-none transition-all duration-300 ease-in-out`}
      >
        <AssistantPanel 
            fullScreen={isFullScreen} 
            onClose={closeAssistant} 
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
        />
      </SheetContent>
    </Sheet>
  );
}
