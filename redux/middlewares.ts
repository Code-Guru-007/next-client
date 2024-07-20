import { Middleware } from "redux";
import { logout } from "components/PrivateLayout/actions";
import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./root";

export const authMiddleware: Middleware<Record<string, unknown>, RootState> =
  () => (next) => (action: PayloadAction<unknown>) => {
    if (logout.match(action)) {
      return undefined;
    }
    return next(action);
  };
