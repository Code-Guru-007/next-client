/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import Collapse from "@mui/material/Collapse";
import Icon from "@mui/material/Icon";
import Alert from "@eGroupAI/material/Alert";
import { LinkProps } from "@mui/material/Link";
import { Typography } from "@mui/material";
import DataTableContext from "./DataTableContext";
import {
  DataTableExtendToolsbarProps,
  EachRowState,
  RowState,
  TableEvent,
} from "./typing";
import { getNextEachRowState } from "./utils";

const DataTableExtendToolsbar = <Data,>(
  props: DataTableExtendToolsbarProps
) => {
  const {
    totalCount,
    onCheckedAllClick,
    onCheckedAllClearClick,
    disabled = false,
  } = props;

  const {
    eachRowState,
    checkedAllPageRows,
    setTableEvent,
    setCheckedAllPageRows,
    setEachRowState,
    lastLoadedRowState,
  } = useContext(DataTableContext);

  const [checkedNums, uncheckedNums] = useMemo(() => {
    const states = Object.values(eachRowState);
    const checkedNums = states.filter((el) => el?.checked).length;
    return [checkedNums, states.length - checkedNums];
  }, [eachRowState]);
  const [isShowAlert, setIsShowAlert] = useState<boolean>(true);

  const handleCheckedAll = useCallback<
    NonNullable<LinkProps["onClick"]>
  >(() => {
    if (onCheckedAllClick) {
      onCheckedAllClick();
    }
    if (setCheckedAllPageRows && setEachRowState && setTableEvent) {
      setTableEvent(TableEvent.CHECKED_ALL_PAGE_ROWS);
      setCheckedAllPageRows(true);
      setEachRowState(
        getNextEachRowState(lastLoadedRowState as EachRowState<Data>, {
          checked: true,
        })
      );
    }
  }, [
    onCheckedAllClick,
    setCheckedAllPageRows,
    setEachRowState,
    setTableEvent,
    lastLoadedRowState,
  ]);

  const handleClearCheckedAll = useCallback<
    NonNullable<LinkProps["onClick"]>
  >(() => {
    if (onCheckedAllClearClick) {
      onCheckedAllClearClick();
    }
    if (setEachRowState && setCheckedAllPageRows && setTableEvent) {
      setTableEvent(TableEvent.CLEAR_ALL_CHECKED_ROWS);
      setCheckedAllPageRows(false);
      setEachRowState((val) => {
        let next: EachRowState<Data> = { ...val };
        Object.keys(val).forEach((key) => {
          next = {
            ...next,
            [key]: {
              ...(next[key] as RowState<Data>),
              checked: false,
            },
          };
        });
        return next;
      });
    }
  }, [
    onCheckedAllClearClick,
    setCheckedAllPageRows,
    setEachRowState,
    setTableEvent,
  ]);

  useEffect(() => {
    if (checkedNums !== 0) {
      setIsShowAlert(true);
    }
    // flexible change of checkedAllPageRows status when table reload & each row state changed
    if (
      checkedAllPageRows &&
      totalCount !== 0 &&
      checkedNums !== totalCount &&
      uncheckedNums !== 0
    ) {
      if (setCheckedAllPageRows) setCheckedAllPageRows(false);
      if (onCheckedAllClearClick) onCheckedAllClearClick();
    }
    if (
      !checkedAllPageRows &&
      totalCount !== 0 &&
      checkedNums === totalCount &&
      uncheckedNums === 0
    ) {
      if (setCheckedAllPageRows) setCheckedAllPageRows(true);
      if (onCheckedAllClick) onCheckedAllClick();
    }
  }, [
    checkedAllPageRows,
    checkedNums,
    uncheckedNums,
    onCheckedAllClearClick,
    onCheckedAllClick,
    setCheckedAllPageRows,
    totalCount,
  ]);

  if (!disabled)
    return (
      <Collapse
        in={(checkedNums !== 0 || checkedAllPageRows) && isShowAlert}
        timeout="auto"
        unmountOnExit
        color="primary"
      >
        <Alert
          severity="info"
          icon={
            <Icon color="primary" className="material-icons-round">
              task_alt
            </Icon>
          }
          onClose={() => {
            setIsShowAlert(false);
          }}
        >
          {checkedAllPageRows ? (
            <>
              {uncheckedNums === 0
                ? "已選擇全部 "
                : `已選擇${totalCount - uncheckedNums}個 `}
              ({" "}
              <Typography
                color="inherit"
                sx={{
                  cursor: "pointer",
                  display: "inline",
                  textDecoration: "underline",
                }}
                onClick={handleClearCheckedAll}
              >
                取消
              </Typography>{" "}
              )
            </>
          ) : (
            <>
              已選擇{checkedNums}個({" "}
              <Typography
                color="inherit"
                sx={{
                  cursor: "pointer",
                  display: "inline",
                  textDecoration: "underline",
                }}
                onClick={handleCheckedAll}
              >
                全選{" "}
              </Typography>
              )
            </>
          )}
        </Alert>
      </Collapse>
    );
  return <></>;
};

export default DataTableExtendToolsbar;
