import React, { forwardRef, HTMLAttributes } from "react";
import { Theme } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import createStyles from "@mui/styles/createStyles";
import clsx from "clsx";
import { Color } from "../types";

export type FontSize = "default" | "large" | "small" | "inherit" | number;
export interface IcomoonProps extends HTMLAttributes<HTMLDivElement> {
  color?: Color;
  type?: string;
  fontSize?: FontSize;
}

const getFontSize = (fontSize: FontSize = "default") => {
  switch (fontSize) {
    case "default":
      return 24;
    case "large":
      return 35;
    case "small":
      return 20;
    case "inherit":
      return "inherit";
    default:
      return fontSize;
  }
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      fontSize: ({ fontSize }: IcomoonProps) => getFontSize(fontSize),
    },
    colorPrimary: {
      color: theme.palette.primary.main,
    },
    colorSecondary: {
      color: theme.palette.secondary.main,
    },
    colorText: {
      color: theme.palette.grey[300],
    },
    colorWhite: {
      color: theme.palette.common.white,
    },
    colorInfo: {
      color: theme.palette.info.main,
    },
    colorSuccess: {
      color: theme.palette.success.main,
    },
    colorWarning: {
      color: theme.palette.warning.main,
    },
    colorError: {
      color: theme.palette.error.main,
    },
    colorInherit: {
      color: "inherit",
    },
  });

const Icomoon = forwardRef<
  HTMLSpanElement,
  IcomoonProps & WithStyles<typeof styles>
>((props, ref) => {
  const { className, classes, type, color = "default", ...other } = props;

  return (
    <span
      ref={ref}
      className={clsx(className, classes.root, {
        [`icon-${type}`]: !!type,
        [classes.colorPrimary]: color === "primary",
        [classes.colorSecondary]: color === "secondary",
        [classes.colorText]: color === "text",
        [classes.colorWhite]: color === "white",
        [classes.colorInfo]: color === "info",
        [classes.colorSuccess]: color === "success",
        [classes.colorWarning]: color === "warning",
        [classes.colorError]: color === "error",
        [classes.colorInherit]: color === "inherit",
      })}
      {...other}
    />
  );
});

export default withStyles(styles, { name: "MuiEgIcomoon" })(Icomoon);
