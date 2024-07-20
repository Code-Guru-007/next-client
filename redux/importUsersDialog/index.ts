/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrganizationUser } from "interfaces/entities";

type InitialState = {
  values: {
    totalUsers?: OrganizationUser[];
    duplicateUsers?: OrganizationUser[];
    uniqueUsers?: OrganizationUser[];
    errorUsers?: OrganizationUser[];
  };
  states: {
    index: number;
    isImporting: boolean;
    selectedSimilarUser?: OrganizationUser;
  };
};

const initialState: InitialState = {
  values: {},
  states: {
    index: 0,
    isImporting: false,
  },
};

const slice = createSlice({
  name: "importUsersDialog",
  initialState,
  reducers: {
    setTotalUsers(state, action: PayloadAction<OrganizationUser[]>) {
      state.values.totalUsers = action.payload;
    },
    setDuplicateUsers(state, action: PayloadAction<OrganizationUser[]>) {
      state.values.duplicateUsers = action.payload;
    },
    setUniqueUsers(state, action: PayloadAction<OrganizationUser[]>) {
      state.values.uniqueUsers = action.payload;
    },
    setErrorUsers(state, action: PayloadAction<OrganizationUser[]>) {
      state.values.errorUsers = action.payload;
    },
    setIndex(state, action: PayloadAction<number>) {
      state.states.index = action.payload;
    },
    setAddIndex(state) {
      state.states.index += 1;
    },
    setSelectedSimilarUser(
      state,
      action: PayloadAction<OrganizationUser | undefined>
    ) {
      state.states.selectedSimilarUser = action.payload;
    },
    setIsImporting(state, action: PayloadAction<boolean>) {
      state.states.isImporting = action.payload;
    },
  },
});

export const {
  setTotalUsers,
  setDuplicateUsers,
  setUniqueUsers,
  setErrorUsers,
  setIndex,
  setAddIndex,
  setSelectedSimilarUser,
  setIsImporting,
} = slice.actions;
export default slice.reducer;
