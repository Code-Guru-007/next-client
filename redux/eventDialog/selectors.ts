import { RootState } from "redux/root";

export const getValues = (state: RootState) => state.eventDialog.values;
export const getStates = (state: RootState) => state.eventDialog.states;
