import { RootState } from "../root";

export const getWordLibrary = (state: RootState) =>
  state.wordLibrary.wordLibrary;
