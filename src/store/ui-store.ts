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
  isOpen: false,
  isHover: false,

  toggleMenu: () => set({ isOpen: !get().isOpen }),
  hoverNavButton: () => {
    const { isOpen, isHover } = get();
    set({ isHover: !isOpen ? !isHover : isHover });
  },
}));
