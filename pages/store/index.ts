import { combineReducers, createStore } from "redux";
import { uiReducer } from "./reducers";

const rootReducer = combineReducers({
  ui: uiReducer
});

export const initialStore = (initialState) => {
  return createStore(rootReducer, initialState);
}

export type AppState = ReturnType<typeof rootReducer>;
