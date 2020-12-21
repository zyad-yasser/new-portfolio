import { uiState } from "../state"
import { UiState, UiActionTypes, HOVER_NAV_BUTTON, TOGGLE_MENU, ACTIVATE_SECTION } from "../types/";

export function uiReducer(
  state = uiState,
  { type, payload: { activeSection } = {} as UiState }: UiActionTypes
): UiState {
  console.log('here')
  switch (type) {
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
    case ACTIVATE_SECTION: {
      console.log(activeSection)
      return {
        ...state,
        activeSection
      };
    }
    default:
      return state;
  }
}
