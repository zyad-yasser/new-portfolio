import { uiState } from "../state"
import { UiState, UiActionTypes, HOVER_NAV_BUTTON, TOGGLE_MENU } from "../types";

export function uiReducer(
  state = uiState,
  action: UiActionTypes
): UiState {
  switch (action.type) {
    case TOGGLE_MENU: {
      return {
        ...state,
        isOpen: !state.isOpen
      };
		}
		case HOVER_NAV_BUTTON: {
      return {
        ...state,
        isHover: 
          !state.isOpen 
          ? !state.isHover 
          : state.isHover
      };
    }
    default:
      return state;
  }
}
