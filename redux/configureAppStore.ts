import { SET_DIALOG_DATA } from "@eGroupAI/redux-modules/dialogs";
import { SET_SNACKBAR_DATA } from "@eGroupAI/redux-modules/snackbars";
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { persistStore } from "redux-persist";

import { rootReducer } from "./root";
import { authMiddleware } from "./middlewares";

function configureAppStore() {
  const store = configureStore({
    reducer: rootReducer,
    // Correct typings for the Dispatch type
    // https://redux-toolkit.js.org/usage/usage-with-typescript
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            SET_DIALOG_DATA,
            SET_SNACKBAR_DATA,
            "persist/PERSIST",
          ],
          ignoredPaths: ["components.MuiThemeProvider", "dialogs", "snackbars"],
        },
      }).concat([authMiddleware]),
    devTools: process.env.NODE_ENV !== "production",
  });

  return store;
}

export const store = configureAppStore();
export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
