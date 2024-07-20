import { createContext } from "react";
import { DataTableContextProps } from "./typing";

const DataTableContext = createContext<DataTableContextProps>({
  eachRowState: {},
  checkedAllPageRows: false,
  lastLoadedRowState: {},
});

export default DataTableContext;
