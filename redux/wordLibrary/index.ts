/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WordLibrary } from "@eGroupAI/typings/apis";

type InitialState = {
  wordLibrary: WordLibrary | undefined;
};

const initialState: InitialState = {
  wordLibrary: undefined,
};

const wordLibrary = createSlice({
  name: "wordlibrary",
  initialState,
  reducers: {
    setWordLibrary(state, action: PayloadAction<WordLibrary | undefined>) {
      state.wordLibrary = action.payload;
    },
  },
});

export const { setWordLibrary } = wordLibrary.actions;
export default wordLibrary.reducer;
