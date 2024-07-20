import React, { forwardRef } from "react";
import { Paper, PaperProps } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    height: 300,
    padding: theme.spacing(1, 2, 5, 0),
    boxShadow: "0 3px 16px 0 rgba(10, 75, 109, 0.08)",

    "& .recharts-legend-item-text": {
      color: `${theme.palette.grey[200]} !important`,
      fontSize: 12,
    },

    "& .recharts-default-tooltip": {
      borderRadius: 8,
      borderColor: theme.palette.grey[400],
    },

    "& .recharts-tooltip-label": {
      color: theme.palette.grey[200],
      fontWeight: 700,
    },

    "& .recharts-tooltip-item": {
      color: `${theme.palette.grey[300]} !important`,
    },

    "& .recharts-layer.recharts-active-dot": {
      color: theme.palette.primary.main,
    },

    "& .recharts-layer.recharts-active-dot circle": {
      fill: "currentcolor",
    },
  },
}));

export type SimpleChartPaperProps = PaperProps;

const SimpleChartPaper = forwardRef<HTMLDivElement, SimpleChartPaperProps>(
  (props, ref) => {
    const classes = useStyles();
    const { className, ...other } = props;
    return (
      <Paper className={clsx(classes.root, className)} ref={ref} {...other} />
    );
  }
);

export default SimpleChartPaper;
