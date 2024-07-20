/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  states: {
    openStatus: boolean;
    changeStauts: boolean;
  };
};

const initialState: InitialState = {
  states: {
    openStatus: false,
    changeStauts: false,
  },
};

const slice = createSlice({
  name: "froalaEditor",
  initialState,
  reducers: {
    setOpenStatus(state, action: PayloadAction<boolean>) {
      state.states.openStatus = action.payload;
    },
    setChangeStatus(state, action: PayloadAction<boolean>) {
      state.states.changeStauts = action.payload;
    },
  },
});

export const { setOpenStatus, setChangeStatus } = slice.actions;
export default slice.reducer;
