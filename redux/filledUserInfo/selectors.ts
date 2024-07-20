import { RootState } from "../root";

export const getValues = (state: RootState) => state.filledUserInfo.values;
export const getStart = (state: RootState) => state.filledUserInfo.ui.start;
export const getSuccess = (state: RootState) => state.filledUserInfo.ui.success;
