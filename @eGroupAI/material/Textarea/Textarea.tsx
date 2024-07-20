import React, { forwardRef } from "react";
import {
  Theme,
  TextareaAutosize as MuiTextareaAutosize,
  TextareaAutosizeProps as MuiTextareaAutosizeProps,
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
import clsx from "clsx";

export interface TextareaProps extends MuiTextareaAutosizeProps {
  error?: boolean;
  success?: boolean;
  warning?: boolean;
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      maxWidth: "100%",
      padding: theme.spacing(1),
      borderWidth: 2,
      borderRadius: theme.shape.borderRadius,
      fontSize: "15px",
      borderColor: theme.palette.grey[400],
      color: theme.palette.grey[200],
      fontFamily: theme.typography.fontFamily,
      "&:hover, &:focus": {
        borderColor: theme.palette.info.main,
        outline: theme.palette.info.main,
      },
    },
    success: {
      borderColor: theme.palette.success.main,
      "&:hover, &:focus": {
        borderColor: theme.palette.success.main,
        outline: theme.palette.success.main,
      },
    },
    error: {
      borderColor: theme.palette.error.main,
      "&:hover, &:focus": {
        borderColor: theme.palette.error.main,
        outline: theme.palette.error.main,
      },
    },
    warning: {
      borderColor: theme.palette.warning.main,
      "&:hover, &:focus": {
        borderColor: theme.palette.warning.main,
        outline: theme.palette.warning.main,
      },
    },
  });

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps & WithStyles<typeof styles>
>((props, ref) => {
  const { className, classes, success, error, warning, ...others } = props;
  return (
    <MuiTextareaAutosize
      ref={ref}
      className={clsx(classes.root, className, {
        [classes.success]: success,
        [classes.error]: error,
        [classes.warning]: warning,
      })}
      {...others}
    />
  );
});

export default withStyles(styles, { name: "MuiEgTextarea" })(Textarea);
