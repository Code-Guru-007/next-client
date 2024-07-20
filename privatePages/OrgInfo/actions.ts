import { createAction } from "@reduxjs/toolkit";
import { Locale } from "interfaces/utils";
// Actions
export const setLocale = createAction<Locale>("setLocale");
