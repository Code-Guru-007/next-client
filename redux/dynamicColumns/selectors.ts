import { RootState } from "../root";

export const getDeletedColumnOptionIds = (state: RootState) =>
  state.dynamicColumns.deletedColumnOptionIds;
export const getIsSorted = (state: RootState) => state.dynamicColumns.isSorted;
export const getEnableSort = (state: RootState) =>
  state.dynamicColumns.enableSort;
