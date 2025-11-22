import { Context, createWrapper } from "next-redux-wrapper";
import { Store, combineReducers, createStore } from "redux";
import { uiReducer } from "./reducers";

const rootReducer = combineReducers({
  ui: uiReducer,
});

const makeStore = (context: Context) => createStore(rootReducer);

export const wrapper = createWrapper<Store<ReturnType<typeof rootReducer>>>(makeStore, {
  debug: false,
});

export type AppState = ReturnType<typeof rootReducer>;
