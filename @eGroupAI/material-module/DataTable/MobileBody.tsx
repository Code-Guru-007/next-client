import React, { useMemo, ReactNode } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { TableBody, TableRow } from "@mui/material";

import Box from "@eGroupAI/material/Box";
import findDeepValue from "@eGroupAI/utils/findDeepValue";
import DataTableRow from "./DataTableRow";
import DataTableCell from "./DataTableCell";
import { MobileBodyProps, DefaultData } from "./typing";
import DataTableRowCheckbox from "./StyledDataTableRowCheckbox";

const useStyles = makeStyles((theme) => ({
  dataRow: {
    display: "block",
    padding: "10px 0px",
    boxShadow: "0px -2px 4px -2px rgb(0 0 0 / 20%)",
    "& > td.MuiTableCell-root": {
      justifyContent: "space-between",
      display: "flex",
      width: `calc(100vw - 33px - ${
        window.innerWidth - document.body.clientWidth
      }px)`,
    },
    "& > td.MuiTableCell-root td": {
      padding: 0,
    },
  },
  columnCell: {
    color: theme.palette.primary.main,
    width: "25%",
    padding: "2px 3px",
    wordWrap: "break-word",
  },
  rowCell: {
    width: "75%",
    textAlign: "right",
    padding: "2px 3px",
    wordWrap: "break-word",
    justifyContent: "right",
  },
  checkBox: {
    paddingLeft: "0px",
  },
}));

const MobileBody = <Data extends DefaultData>(props: MobileBodyProps<Data>) => {
  const classes = useStyles(props);

  const {
    columns: columnsProp,
    enableRowCollapse,
    enableRowCheckbox,
    outSideAllCheckbox,
    data,
    rowKey,
    renderDataRowDetail,
    enableSelectColumn,
    selectedColumnIds,
    renderDataRow,
  } = props;

  const selectedColumns = useMemo(
    () =>
      enableSelectColumn
        ? columnsProp?.filter((el) => selectedColumnIds?.includes(el.id))
        : columnsProp,
    [enableSelectColumn, columnsProp, selectedColumnIds]
  );

  const renderCell = () => {
    if (data) {
      return (
        <TableRow>
          {data.map((rowData: Data, index: number) => {
            if (renderDataRow) {
              return renderDataRow(rowData, index);
            }
            const dataid = findDeepValue<string>(rowData, rowKey);
            const enableCheckbox =
              (enableRowCheckbox || outSideAllCheckbox) &&
              typeof dataid !== "undefined";
            if (selectedColumns) {
              return (
                <DataTableRow
                  {...rowData.TableRowProps}
                  key={dataid}
                  dataId={dataid}
                  data={rowData}
                  collapse={enableRowCollapse}
                  detail={
                    renderDataRowDetail
                      ? renderDataRowDetail(rowData, index)
                      : undefined
                  }
                  className={classes.dataRow}
                >
                  <DataTableCell sx={{ display: "block" }}>
                    {enableCheckbox && (
                      <DataTableRowCheckbox
                        data={rowData}
                        dataId={dataid as string}
                        size="small"
                        className={classes.checkBox}
                      />
                    )}
                  </DataTableCell>
                  {selectedColumns.map((col) => {
                    if (col.render) {
                      return (
                        <DataTableCell
                          key={col.id}
                          sx={{
                            alignItems: "center",
                          }}
                        >
                          <Box className={classes.columnCell}>{col.name}</Box>
                          <Box
                            className={classes.rowCell}
                            sx={{
                              display: "flex",
                            }}
                          >
                            {col.render(rowData)}
                          </Box>
                        </DataTableCell>
                      );
                    }
                    const value = col.dataKey
                      ? findDeepValue<ReactNode>(rowData, col.dataKey)
                      : undefined;
                    return (
                      <DataTableCell
                        key={col.id}
                        isFixed={!!col.fixed}
                        direction={col.fixed}
                        sx={{
                          alignItems: "baseline",
                        }}
                      >
                        <Box className={classes.columnCell}>{col.name}</Box>
                        <Box
                          className={classes.rowCell}
                          sx={{
                            display: "block",
                          }}
                        >
                          {col.format ? col.format(value) : value}
                        </Box>
                      </DataTableCell>
                    );
                  })}
                </DataTableRow>
              );
            }
            return undefined;
          })}
        </TableRow>
      );
    }
    return undefined;
  };

  return <TableBody>{renderCell()}</TableBody>;
};

export default MobileBody;
