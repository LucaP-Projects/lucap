import { produce } from 'immer';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type SidebarSettings = {
  disabled: boolean;
  isHoverOpen: boolean;
};

type SidebarStore = {
  isOpen: boolean;
  isHover: boolean;
  settings: SidebarSettings;
  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsHover: (isHover: boolean) => void;
  getOpenState: () => boolean;
  setSettings: (settings: Partial<SidebarSettings>) => void;
  resetState: () => void;
};

const initialState = {
  isOpen: true,
  isHover: false,
  settings: {
    disabled: false,
    isHoverOpen: false
  }
};

export const useSidebar = create(
  persist<SidebarStore>(
    (set, get) => ({
      ...initialState,
      toggleOpen: () => set({ isOpen: !get().isOpen }),
      setIsOpen: (isOpen: boolean) => set({ isOpen }),
      setIsHover: (isHover: boolean) => set({ isHover }),
      getOpenState: () => {
        const state = get();
        return state.isOpen || (state.settings.isHoverOpen && state.isHover);
      },
      setSettings: (settings: Partial<SidebarSettings>) =>
        set(
          produce((state: SidebarStore) => {
            state.settings = { ...state.settings, ...settings };
          })
        ),
      resetState: () => set(initialState)
    }),
    {
      name: 'sidebar',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
