"use client";

import { useState } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAssistantStore } from "@/stores/useAssistantStore";
import { AssistantPanel } from "./assistant-panel";

export function AssistantDrawer() {
  const { isOpen, closeAssistant } = useAssistantStore();
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={closeAssistant}>
      <SheetContent 
        side="right" 
        className={`${isFullScreen ? "w-screen max-w-none" : "w-full sm:max-w-[450px]"} p-0 border-none transition-all duration-300 ease-in-out`}
      >
        <VisuallyHidden.Root>
            <SheetTitle>AI Assistant</SheetTitle>
        </VisuallyHidden.Root>
        <AssistantPanel 
            fullScreen={isFullScreen} 
            onClose={closeAssistant} 
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
        />
      </SheetContent>
    </Sheet>
  );
}
