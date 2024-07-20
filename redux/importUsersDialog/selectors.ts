import { RootState } from "../root";

export const getTotalUsers = (state: RootState) =>
  state.importUsersDialog.values.totalUsers || [];
export const getDuplicateUsers = (state: RootState) =>
  state.importUsersDialog.values.duplicateUsers || [];
export const getUniqueUsers = (state: RootState) =>
  state.importUsersDialog.values.uniqueUsers || [];
export const getErrorUsers = (state: RootState) =>
  state.importUsersDialog.values.errorUsers || [];
export const getIndex = (state: RootState) =>
  state.importUsersDialog.states.index;
export const getIsImporting = (state: RootState) =>
  state.importUsersDialog.states.isImporting;
export const getSelectedSimilarUser = (state: RootState) =>
  state.importUsersDialog.states.selectedSimilarUser;
