"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAssistantStore } from "@/stores/useAssistantStore";
import debounce from "lodash.debounce";

interface UIObserverProps {
  title: string;
  data?: any;
}

export function UIObserver({ title, data }: UIObserverProps) {
  const pathname = usePathname();
  const setUIContext = useAssistantStore((state) => state.setUIContext);

  useEffect(() => {
    const updateContext = debounce(() => {
      setUIContext({
        path: pathname,
        title,
        data,
        timestamp: Date.now(),
      });
    }, 500);

    updateContext();
    return () => updateContext.cancel();
  }, [pathname, title, data, setUIContext]);

  return null;
}
