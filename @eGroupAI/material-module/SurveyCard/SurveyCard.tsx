import React, { forwardRef } from "react";

import { Theme } from "@mui/material";
import { WithStyles } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
import Paper, { PaperProps } from "@mui/material/Paper";
import clsx from "clsx";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2, 3),
      boxShadow: "0px 0px 30px 1px #0000001f",
      border: "1px solid #e3e6f0",
      borderRadius: "0.35rem",
    },
  });

export type SurveyCardProps = PaperProps;

const SurveyCard = forwardRef<
  HTMLDivElement,
  SurveyCardProps & WithStyles<typeof styles>
>((props, ref) => {
  const { classes, className, ...other } = props;
  return (
    <Paper ref={ref} className={clsx(className, classes.root)} {...other} />
  );
});

export default withStyles(styles)(SurveyCard);
