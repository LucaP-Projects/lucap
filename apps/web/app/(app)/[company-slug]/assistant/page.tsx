"use client";

import { AssistantPanel } from "@/components/shared/assistant-panel";

export default function AssistantPage() {
  return (
    <div className="h-[calc(100vh-4rem)] bg-white">
      <AssistantPanel fullScreen />
    </div>
  );
}
