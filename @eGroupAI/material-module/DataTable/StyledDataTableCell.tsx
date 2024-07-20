import React, { forwardRef } from "react";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import clsx from "clsx";
import DataTableCell, { DataTableCellProps } from "./DataTableCell";

export interface StyledDataTableCellProps extends DataTableCellProps {
  /**
   * Table Cell vertical Alignment
   * @default inherit
   */
  verticalAlign?: "justtify" | "top" | "center" | "bottom" | "inherit";
}

const useStyles = makeStyles((theme: Theme) => ({
  vAlign: {
    verticalAlign: ({ verticalAlign = "inherit" }: StyledDataTableCellProps) =>
      `${verticalAlign}`,
    color: theme.palette.grey[300],
  },
}));

const StyledDataTableCell = forwardRef<
  HTMLTableCellElement,
  StyledDataTableCellProps
>((props, ref) => {
  const { children, verticalAlign, ...other } = props;
  const classes = useStyles(props);

  return (
    <DataTableCell className={clsx(classes.vAlign)} ref={ref} {...other}>
      {children}
    </DataTableCell>
  );
});

export default StyledDataTableCell;
