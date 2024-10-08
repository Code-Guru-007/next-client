import React, { FC, useState } from "react";
import {
  TableSortLabel,
  TableSortLabelProps as MuiTableSortLabelProps,
} from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles(
  (theme) => ({
    root: {
      color: theme.palette.info.main,
      "&.MuiTableSortLabel-active": {
        color: theme.palette.primary.main,
      },
      "&.MuiTableSortLabel-active .MuiTableSortLabel-icon": {
        color: `${theme.palette.primary.main} !important`,
      },
      "&:hover": {
        color: theme.palette.primary.main,
      },
    },
  }),
  {
    name: "MuiEgDataTableSortLabel",
  }
);

export type Direction = "desc" | "asc";
export interface TableSortLabelProps
  extends Omit<MuiTableSortLabelProps, "onClick"> {
  isSort?: boolean;
  onClick: (direction: Direction) => void;
}

const DataTableSortLabel: FC<TableSortLabelProps> = (props) => {
  const classes = useStyles();
  const { isSort = false, onClick, children, ...other } = props;
  const [direction, setDirection] = useState<Direction>("desc");

  if (!isSort) {
    return <>{children}</>;
  }
  return (
    <TableSortLabel
      className={classes.root}
      direction={direction}
      onClick={() => {
        let next = direction;
        if (direction === "desc") {
          next = "asc";
        } else {
          next = "desc";
        }
        setDirection(next);
        if (onClick) {
          onClick(next);
        }
      }}
      {...other}
    >
      {children}
    </TableSortLabel>
  );
};

export default DataTableSortLabel;
