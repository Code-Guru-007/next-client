import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import {
  Box,
  TableCell,
  Typography,
  tableCellClasses,
  useTheme,
} from "@mui/material";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import { LinkProps } from "@mui/material/Link";
import DataTableSortLabel from "./DataTableSortLabel";
import DataTableCell from "./DataTableCell";
import {
  ColumnArgs,
  DataTableHeadProps,
  EachRowState,
  RowState,
  TableEvent,
} from "./typing";
import DataTableOutSideAllCheckbox from "./StyledDataTableOutSideAllCheckbox";
import DataTableContext from "./DataTableContext";
import { getNextEachRowState } from "./utils";

const DataTableHead = <Data,>(props: DataTableHeadProps<Data>) => {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    columns,
    eachRowState,
    renderColumns,
    onSortLabelClick,
    enableRowCollapse,
    enableRowCheckbox,
    outSideAllCheckbox,
    rowsPerPage,
    curPage = 0,
    totalCount = 0,
    onCheckedAllClick,
    onCheckedAllClearClick,
    selectedToolsbar,
    isBorderSeparate,
  } = props;
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState<number>();

  const {
    checkedAllPageRows,
    setTableEvent,
    setCheckedAllPageRows,
    setEachRowState,
    lastLoadedRowState,
  } = useContext(DataTableContext);

  const [checkedNums, uncheckedNums] = useMemo(() => {
    const states = Object.values(eachRowState as EachRowState<Data>);
    const checkedNums = states.filter((el) => el?.checked).length;
    return [checkedNums, states.length - checkedNums];
  }, [eachRowState]);

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

  const renderFirstCell = () => {
    if (enableRowCollapse && !enableRowCheckbox) {
      return <DataTableCell direction="left" zIndex={4} align="left" />;
    }
    if (outSideAllCheckbox) {
      return <DataTableCell direction="left" zIndex={4} align="left" />;
    }
    if (!outSideAllCheckbox && enableRowCheckbox) {
      let rowsOnPage = rowsPerPage;
      const pageCount = Math.floor(totalCount / rowsPerPage) + 1;
      if (curPage + 1 === pageCount) {
        if ((curPage + 1) * rowsPerPage > totalCount)
          rowsOnPage = totalCount - curPage * rowsPerPage;
      }

      return (
        <DataTableCell
          direction="left"
          zIndex={4}
          align="left"
          sx={{
            width: "0px",
          }}
        >
          <DataTableOutSideAllCheckbox
            id="datatable-checkbox-all"
            dataTid="datatable-checkbox-all"
            rowsPerPage={totalCount === 0 ? rowsPerPage : rowsOnPage}
          />
        </DataTableCell>
      );
    }
    return undefined;
  };

  const renderCheckedStatus = () => (
    <Typography
      variant="subtitle2"
      sx={{
        ml: 2,
        flexGrow: 1,
        color: "primary.main",
      }}
    >
      {checkedAllPageRows ? (
        <>
          {uncheckedNums === 0
            ? "已選擇全部 "
            : `已選擇${totalCount - uncheckedNums}個`}
          ({" "}
          <Typography
            color="inherit"
            sx={{
              cursor: "pointer",
              display: "inline",
              textDecoration: "underline",
              fontWeight: "bold",
              fontSize: "0.875rem",
            }}
            onClick={handleClearCheckedAll}
          >
            取消
          </Typography>{" "}
          )
        </>
      ) : (
        <>
          已選擇{checkedNums}個 ({" "}
          <Typography
            color="inherit"
            sx={{
              cursor: "pointer",
              display: "inline",
              textDecoration: "underline",
              fontWeight: "bold",
              fontSize: "0.875rem",
            }}
            onClick={handleCheckedAll}
          >
            全選
          </Typography>{" "}
          )
        </>
      )}
    </Typography>
  );

  const renderSelectedHead = () => (
    <TableRow
      sx={
        isBorderSeparate
          ? {
              [`& .${tableCellClasses.head}`]: {
                "&:first-of-type": {
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                },
                "&:last-of-type": {
                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 12,
                },
              },
              position: "absolute",
              display: "table",
              visibility: checkedNums !== 0 ? "visible" : "hidden",
              width: "100%",
              top: -16,
              left: 0,
              right: 0,
              height: "100%",
              "& th": {
                bgcolor: theme.palette.primary.lighter,
              },
            }
          : {
              position: "absolute",
              display: "table",
              visibility: checkedNums !== 0 ? "visible" : "hidden",
              width: "100%",
              top: 0,
              left: 0,
              right: 0,
              height: "100%",
              "& th": {
                bgcolor: theme.palette.primary.lighter,
              },
            }
      }
    >
      {renderFirstCell()}
      <TableCell sx={{ left: 0 }} colSpan={2}>
        {renderCheckedStatus()}
      </TableCell>
      <TableCell sx={{ right: 0 }} colSpan={(columns?.length as number) - 2}>
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "end" }}
        >
          {selectedToolsbar}
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderHead = () => {
    const columnArgs: ColumnArgs = {
      activeIndex,
      eachRowState,
    };
    if (renderColumns) {
      return renderColumns(columns || [], columnArgs);
    }
    if (columns) {
      return (
        <TableRow
          sx={
            isBorderSeparate
              ? {
                  [`& .${tableCellClasses.head}`]: {
                    "&:first-of-type": {
                      borderTopLeftRadius: 12,
                      borderBottomLeftRadius: 12,
                    },
                    "&:last-of-type": {
                      borderTopRightRadius: 12,
                      borderBottomRightRadius: 12,
                    },
                  },
                }
              : undefined
          }
        >
          {renderFirstCell()}
          {columns.map((el, index) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {
              id,
              name,
              fixed,
              sortKey,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              format,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              dataKey,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render,
              ...other
            } = el;
            return (
              <DataTableCell
                key={id}
                isFixed={!!fixed}
                direction={fixed}
                zIndex={4}
                {...other}
              >
                <DataTableSortLabel
                  isSort={!!sortKey}
                  active={activeIndex === index}
                  onClick={(direction) => {
                    if (sortKey) {
                      setActiveIndex(index);
                      if (onSortLabelClick) {
                        onSortLabelClick(sortKey, direction);
                      }
                    }
                  }}
                  sx={{ minHeight: 48 }}
                >
                  {wordLibrary?.[name] ?? name}
                </DataTableSortLabel>
              </DataTableCell>
            );
          })}
        </TableRow>
      );
    }
    return undefined;
  };

  return (
    <TableHead sx={{ position: "relative", overflow: "unset" }}>
      {renderHead()}
      {renderSelectedHead()}
    </TableHead>
  );
};

export default DataTableHead;
