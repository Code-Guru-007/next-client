import React, { useContext, useMemo, forwardRef, ForwardedRef } from "react";
import Checkbox, { CheckboxProps } from "@eGroupAI/material/Checkbox";
import DataTableContext from "./DataTableContext";
import { TableEvent } from "./typing";
import { checkedDisplayRowState } from "./utils";

export interface DataTableCheckedAllCheckboxProps extends CheckboxProps {
  rowsPerPage: number;
  id?: string;
  dataTid?: string;
}

const DataTableCheckedAllCheckbox = forwardRef(
  <Data,>(
    props: DataTableCheckedAllCheckboxProps,
    ref?: ForwardedRef<HTMLButtonElement>
  ) => {
    const { rowsPerPage, id, dataTid, ...other } = props;
    const { setTableEvent, eachRowState, setEachRowState } =
      useContext(DataTableContext);
    const checkedNums = useMemo(
      () =>
        Object.values(eachRowState).filter((el) => el?.checked && el.display)
          .length,
      [eachRowState]
    );
    const isAllChecked = useMemo(
      () => Object.keys(eachRowState).length > 0 && checkedNums === rowsPerPage,
      [checkedNums, eachRowState, rowsPerPage]
    );
    const indeterminate = useMemo(
      () => !isAllChecked && checkedNums > 0,
      [checkedNums, isAllChecked]
    );

    return (
      <Checkbox
        ref={ref}
        id={id}
        data-tid={dataTid}
        {...other}
        size="small"
        checked={isAllChecked}
        onChange={(_, checked) => {
          if (!setTableEvent || !setEachRowState) return;

          if (indeterminate || isAllChecked) {
            setTableEvent(TableEvent.CHNAGE_ALL_CHECKED_ROWS);
            setEachRowState((val) => checkedDisplayRowState<Data>(val, false));
          } else {
            setTableEvent(TableEvent.CHNAGE_ALL_CHECKED_ROWS);
            setEachRowState((val) =>
              checkedDisplayRowState<Data>(val, checked)
            );
          }
        }}
        indeterminate={indeterminate}
      />
    );
  }
);

export default DataTableCheckedAllCheckbox;
