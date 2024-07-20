import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  lastUpdateTime: string;
};

const initialState: InitialState = {
  lastUpdateTime: "",
};

const lastUpdateTime = createSlice({
  name: "lastUpdateTime",
  initialState,
  reducers: {
    setArticleBulletinLastUpdateTime(state, action: PayloadAction<string>) {
      state.lastUpdateTime = action.payload;
    },
  },
});

export const { setArticleBulletinLastUpdateTime } = lastUpdateTime.actions;
export default lastUpdateTime.reducer;
