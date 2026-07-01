"use client";

import { create } from "zustand";

interface UIContext {
  path: string;
  title: string;
  data?: any;
  timestamp: number;
}

interface AssistantStore {
  isOpen: boolean;
  currentUIContext: UIContext | null;
  setUIContext: (context: UIContext) => void;
  clearUIContext: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
}

export const useAssistantStore = create<AssistantStore>((set) => ({
  isOpen: false,
  currentUIContext: null,
  setUIContext: (context) => set({ currentUIContext: context }),
  clearUIContext: () => set({ currentUIContext: null }),
  openAssistant: () => set({ isOpen: true }),
  closeAssistant: () => set({ isOpen: false }),
  toggleAssistant: () => set((state) => ({ isOpen: !state.isOpen })),
}));
