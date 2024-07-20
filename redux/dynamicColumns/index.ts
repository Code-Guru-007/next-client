/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  deletedColumnOptionIds: string[];
  isSorted: boolean;
  enableSort: boolean;
};

const initialState: InitialState = {
  deletedColumnOptionIds: [],
  isSorted: false,
  enableSort: false,
};

const slice = createSlice({
  name: "dynamicColumns",
  initialState,
  reducers: {
    setDeletedColumnOptionIds(state, action: PayloadAction<string[]>) {
      state.deletedColumnOptionIds = action.payload;
    },
    setIsSorted(state, action: PayloadAction<boolean>) {
      state.isSorted = action.payload;
    },
    setEnableSort(state, action: PayloadAction<boolean>) {
      state.enableSort = action.payload;
    },
  },
});

export const { setDeletedColumnOptionIds, setIsSorted, setEnableSort } =
  slice.actions;
export default slice.reducer;
