import { combineReducers, createStore, Store } from "redux";
import { createWrapper, Context } from "next-redux-wrapper";
import { uiReducer } from "./reducers";

const rootReducer = combineReducers({
  ui: uiReducer
});

const makeStore = (context: Context) => createStore(rootReducer);

export const wrapper = createWrapper<Store<ReturnType<typeof rootReducer>>>(makeStore, { debug: false });

export type AppState = ReturnType<typeof rootReducer>;
