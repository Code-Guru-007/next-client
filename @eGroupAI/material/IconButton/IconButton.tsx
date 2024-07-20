import React, { forwardRef } from "react";
import clsx from "clsx";
import {
  alpha,
  IconButton as MuiIconButton,
  IconButtonProps as MuiIconButtonProps,
  Theme,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Color } from "../types";

export interface IconButtonProps<D = React.ElementType>
  extends Omit<MuiIconButtonProps, "color"> {
  color?: Color;
  variant?: "standard" | "rounded";
  component?: D;
}

const getStyles = (theme: Theme, color: Color) => {
  const colors = {
    secondary: theme.palette.secondary.main,
    text: theme.palette.grey[100],
    warning: theme.palette.warning.main,
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };
  return {
    color: color === "text" ? theme.palette.grey[400] : theme.palette.grey[100],
    padding: "8px",
    backgroundColor: colors[color],
    "&:hover": {
      backgroundColor:
        color === "text" ? theme.palette.grey[300] : colors[color],
      filter:
        color !== "text" ? `drop-shadow(0px 0px 8px ${colors[color]})` : "none",
    },
    "&.Mui-disabled": {
      color: theme.palette[color].light,
    },
  };
};

const useStyles = makeStyles(
  (theme: Theme) => ({
    colorPrimary: getStyles(theme, "primary"),
    colorSecondary: getStyles(theme, "secondary"),
    colorText: getStyles(theme, "text"),
    colorInfo: getStyles(theme, "info"),
    colorWhite: {
      color: theme.palette.grey[500],
      backgroundColor: theme.palette.common.white,
      "&:hover": {
        backgroundColor: theme.palette.common.white,
      },
      "&.Mui-disabled": {
        color: theme.palette.grey[600],
      },
    },
    colorSuccess: getStyles(theme, "success"),
    colorWarning: getStyles(theme, "warning"),
    colorError: getStyles(theme, "error"),
    colorInherit: {
      color: "inherit",
      "&:hover": {
        backgroundColor: alpha(
          theme.palette.common.white,
          theme.palette.action.hoverOpacity
        ),
      },
      "&.Mui-disabled": {
        color: theme.palette.grey[400],
      },
    },
    rounded: {
      borderRadius: "50%",
      "& .MuiSvgIcon-root": {
        width: "40px",
        height: "40px",
      },
    },
    colorWhiteRounded: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.grey[100],
      "&:hover": {
        backgroundColor: theme.palette.common.white,
      },
      "&.Mui-disabled": {
        backgroundColor: theme.palette.grey[400],
      },
    },
    colorInheritRounded: {
      backgroundColor: theme.palette.common.white,
      color: "inherit",
      "&:hover": {
        backgroundColor: theme.palette.common.white,
      },
      "&.Mui-disabled": {
        backgroundColor: theme.palette.grey[400],
      },
    },
  }),
  {
    name: "MuiEgIconButton",
  }
);

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (props, ref) => {
    const {
      colorPrimary,
      colorSecondary,
      colorText,
      colorInfo,
      colorWhite,
      colorSuccess,
      colorWarning,
      colorError,
      colorInherit,
      rounded,
      colorWhiteRounded,
      colorInheritRounded,
      ...classes
    } = useStyles();
    const { className, color = "text", variant = "standard", ...other } = props;

    const isPrimary = color === "primary";
    const isSecondary = color === "secondary";
    const isText = color === "text";
    const isWhite = color === "white";
    const isInfo = color === "info";
    const isSuccess = color === "success";
    const isWarning = color === "warning";
    const isError = color === "error";
    const isInherit = color === "inherit";
    const isRounded = variant === "rounded";
    return (
      <MuiIconButton
        ref={ref}
        className={clsx(
          {
            [colorPrimary]: isPrimary,
            [colorSecondary]: isSecondary,
            [colorText]: isText,
            [colorInfo]: isInfo,
            [colorWhite]: isWhite,
            [colorSuccess]: isSuccess,
            [colorWarning]: isWarning,
            [colorError]: isError,
            [colorInherit]: isInherit,
            [rounded]: isRounded,
            [colorWhiteRounded]: isRounded && isWhite,
            [colorInheritRounded]: isRounded && isInherit,
          },
          className
        )}
        classes={classes}
        {...other}
      />
    );
  }
);

export default IconButton;
