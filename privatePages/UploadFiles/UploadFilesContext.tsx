import { createContext } from "react";
import {
  FilterValues,
  TableFilterCondition,
} from "@eGroupAI/material-module/DataTable";
import { FilterSearch, FilterConditionGroup } from "@eGroupAI/typings/apis";
import { Value } from "@eGroupAI/material-lab/FilterDropDown";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";

interface TableFilterConditionGroup extends FilterConditionGroup {
  filterConditionList: TableFilterCondition[];
}

export type UploadFilesContextProps = {
  handleChangePage?: (_: any, { page, rowsPerPage }: any) => void;
  handleRowsPerPageChange?: (_: any, { rowsPerPage }: any) => void;
  handleSearchChange?: (v: any) => void;
  handleFilterValuesChange?: (filterValues: FilterValues) => void;
  handleSelectFilterView?: ({
    startIndex,
    size,
    equal,
    range,
    filterValues,
  }: any) => void;
  handleFilterValuesSubmit?: (filterValues: FilterValues) => void;
  handleFilterValuesClear?: (
    filterValues: FilterValues,
    clearState: string | number
  ) => void;
  page?: number;
  rowsPerPage: number;
  filterConditionGroups: TableFilterConditionGroup[] | undefined;
  handleFilterSubmit: (values: Value) => void;
  handleFilterClear: (e: any, values: Value) => void;
  isValidating: boolean;
  filterSearch: FilterSearch | undefined;
  payload: DefaultPayload;
  mutate: () => void;
  columns: {
    id: string;
    name: string;
    sortKey: string | undefined;
    dataKey: string | undefined;
    format: ((val: React.ReactNode) => React.ReactNode) | undefined;
  }[];
  isFilterConditionGroupsValidating: boolean;
  setPayload: React.Dispatch<React.SetStateAction<DefaultPayload>>;
};

const UploadFilesContext = createContext<UploadFilesContextProps>({
  handleChangePage: () => {},
  handleRowsPerPageChange: () => {},
  handleSearchChange: () => {},
  handleFilterValuesChange: () => {},
  handleSelectFilterView: () => {},
  handleFilterValuesSubmit: () => {},
  handleFilterValuesClear: () => {},
  page: 0,
  rowsPerPage: 0,
  filterConditionGroups: undefined,
  handleFilterSubmit: () => {},
  handleFilterClear: () => {},
  isValidating: false,
  filterSearch: undefined,
  payload: {},
  mutate: () => {},
  columns: [
    {
      id: "",
      name: "",
      sortKey: undefined,
      dataKey: undefined,
      format: undefined,
    },
  ],
  isFilterConditionGroupsValidating: false,
  setPayload: () => {},
});

export default UploadFilesContext;
