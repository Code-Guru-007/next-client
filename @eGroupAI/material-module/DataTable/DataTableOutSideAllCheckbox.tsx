import React from "react";
import DataTableCheckedAllCheckbox from "./DataTableCheckedAllCheckbox";

export interface DataTableOutSideAllCheckboxProps {
  rowsPerPage: number;
  id?: string;
  dataTid?: string;
}

const DataTableOutSideAllCheckbox = (
  props: DataTableOutSideAllCheckboxProps
) => {
  const { rowsPerPage, ...other } = props;
  return (
    <div>
      <DataTableCheckedAllCheckbox rowsPerPage={rowsPerPage} {...other} />
    </div>
  );
};

export default DataTableOutSideAllCheckbox;
