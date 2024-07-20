import { RootState } from "../root";

export const getStepStates = (state: RootState, name: string) =>
  state.steps[name];
