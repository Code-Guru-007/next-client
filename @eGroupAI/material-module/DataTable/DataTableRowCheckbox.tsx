/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
} from "react";
import useControlled from "@eGroupAI/hooks/useControlled";
import Checkbox, { CheckboxProps } from "@eGroupAI/material/Checkbox";
import DataTableContext from "./DataTableContext";
import { RowState, TableEvent } from "./typing";

export interface DataTableRowCheckboxProps<Data> extends CheckboxProps {
  dataId: string;
  data?: Data;
}

const DataTableRowCheckbox = forwardRef(
  <Data,>(
    props: DataTableRowCheckboxProps<Data>,
    ref?: ForwardedRef<HTMLButtonElement>
  ) => {
    const {
      dataId,
      data,
      checked: checkedProp,
      defaultChecked = false,
      onChange,
      ...other
    } = props;

    const {
      setEachRowState,
      eachRowState,
      setTableEvent,
      tableEvent,
      checkedAllPageRows,
    } = useContext(DataTableContext);

    const [checked, setChecked] = useControlled({
      controlled: checkedProp,
      default: defaultChecked,
    });

    useEffect(() => {
      if (setEachRowState) {
        setEachRowState((val) => ({
          ...val,
          [dataId]: {
            checked: checkedAllPageRows ? true : Boolean(val[dataId]?.checked),
            ...val[dataId],
            data,
            display: true,
          },
        }));
      }
      return () => {
        if (setEachRowState) {
          setEachRowState((val) => ({
            ...val,
            [dataId]: {
              ...(val[dataId] as RowState<Data>),
              display: false,
            },
          }));
        }
      };
    }, [data]);

    useEffect(() => {
      const rowInfo = eachRowState[dataId];
      if (rowInfo) {
        setChecked(rowInfo.checked);
      } else {
        setChecked(false);
      }
    }, [eachRowState, tableEvent]);

    const handleChange = useCallback<NonNullable<CheckboxProps["onChange"]>>(
      (e, checked) => {
        if (onChange) {
          onChange(e, checked);
        }
        if (setTableEvent) {
          setTableEvent(TableEvent.CHNAGE_CHECKED_ROW);
        }
        if (setEachRowState) {
          setEachRowState((val) => ({
            ...val,
            [dataId]: {
              ...(val[dataId] as RowState<Data>),
              checked,
            },
          }));
        }
      },
      [dataId, onChange, setEachRowState, setTableEvent]
    );

    const handleClickCheckbox = (e) => {
      e.stopPropagation();
    };

    return (
      <Checkbox
        id={`datatable-checkbox-${dataId}`}
        data-tid={`datatable-checkbox-${dataId}`}
        checked={checked}
        onChange={handleChange}
        onClick={handleClickCheckbox}
        ref={ref}
        sx={{ margin: "4px 0px" }}
        {...other}
      />
    );
  }
);

export default DataTableRowCheckbox;
