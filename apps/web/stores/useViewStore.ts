// stores/useViewStore.ts
import { create } from 'zustand';

type ActiveView = 'form' | 'payor' | 'email' | 'pdf';

interface ViewState {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}
type UploadState = {
  isUploading: boolean;
  setUploading: (status: boolean) => void;
};

export const useUploadStore = create<UploadState>((set) => ({
  isUploading: false,
  setUploading: (status) => set({ isUploading: status })
}));

export const useViewStore = create<ViewState>((set) => ({
  activeView: 'form',
  setActiveView: (view) => set({ activeView: view })
}));
