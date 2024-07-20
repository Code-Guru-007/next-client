import { RootState } from "../root";

export const getOpenStatus = (state: RootState) =>
  state.froalaEditor.states.openStatus;

export const getChangeStatus = (state: RootState) =>
  state.froalaEditor.states.changeStauts;
