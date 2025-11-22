import { create } from "zustand";

export interface UiState {
  isOpen: boolean;
  isHover: boolean;
}

interface UiActions {
  toggleMenu: () => void;
  hoverNavButton: () => void;
}

export type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>((set, get) => ({
  // Initial state
  isOpen: false,
  isHover: false,

  // Actions
  toggleMenu: () => set({ isOpen: !get().isOpen }),
  hoverNavButton: () => {
    const { isOpen, isHover } = get();
    set({ isHover: !isOpen ? !isHover : isHover });
  },
}));