interface ToggleMenuAction {
  type: typeof TOGGLE_MENU;
  payload: UiState;
}

interface HoverNavButtonAction {
  type: typeof HOVER_NAV_BUTTON;
  payload: UiState;
}

interface ActivateSectionAction {
  type: typeof ACTIVATE_SECTION;
  payload: UiState;
}

export type UiActionTypes = ToggleMenuAction | HoverNavButtonAction | ActivateSectionAction;
export const TOGGLE_MENU = "TOGGLE_MENU";
export const HOVER_NAV_BUTTON = "HOVER_NAV_BUTTON";
export const ACTIVATE_SECTION = "ACTIVATE_SECTION";

export interface UiState {
  isOpen: boolean;
  isHover: boolean;
  activeSection: number;
}
