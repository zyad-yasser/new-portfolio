interface ToggleMenuAction {
  type: typeof TOGGLE_MENU;
  payload: UiState;
}

interface HoverNavButtonAction {
  type: typeof HOVER_NAV_BUTTON;
  payload: UiState;
}

export type UiActionTypes = ToggleMenuAction | HoverNavButtonAction;
export const TOGGLE_MENU = "TOGGLE_MENU";
export const HOVER_NAV_BUTTON = "HOVER_NAV_BUTTON";

export interface UiState {
  isOpen: boolean;
  isHover: boolean;
}