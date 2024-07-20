import React, { FC } from "react";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { Theme } from "@mui/material";

export interface IconProps {
  /**
   * background color of Icon
   */
  backgroundColor?:
    | "text"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error";
  /**
   * The SVG color of icon
   */
  color?:
    | "text"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error";
  /**
   * Size of icon
   */
  size?: "xs" | "sm" | "md";
  /**
   * type of wrapper of icon
   */
  variant?: "default" | "contained" | "hover";
  /**
   * label of icon
   */
  label?: string;
}

const useStyles = makeStyles((theme: Theme) => {
  const colors = {
    text: theme.palette.grey[300],
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };
  return {
    wrapper: {
      display: "inline-block",
      position: "relative",
    },
    root: {
      borderRadius: "50%",
      display: "inline-block",
      textAlign: "center",
    },
    defaultIcon: {
      "& .MuiSvgIcon-root": {
        color: ({ color = "text" }: IconProps) =>
          color === "text" ? colors[color] : colors[color],
      },
    },
    containedIcon: {
      backgroundColor: ({ backgroundColor = "text" }: IconProps) =>
        backgroundColor === "text"
          ? theme.palette.grey[500]
          : colors[backgroundColor],
      "& .MuiSvgIcon-root": {
        color: ({ color = "text" }: IconProps) =>
          color === "text" ? colors[color] : theme.palette.grey[700],
      },
    },
    hoverIcon: {
      "&:hover": {
        backgroundColor: ({ backgroundColor = "text" }: IconProps) =>
          backgroundColor === "text"
            ? theme.palette.grey[500]
            : colors[backgroundColor],
      },
      "& .MuiSvgIcon-root": {
        color: ({ color = "text" }: IconProps) =>
          color === "text" ? colors[color] : theme.palette.grey[700],
      },
    },
    xsIcon: {
      "& .MuiSvgIcon-root": {
        height: "10px",
        width: "10px",
      },
    },
    smIcon: {
      width: "28px",
      height: "28px",
      padding: 5,
      "& .MuiSvgIcon-root": {
        height: "18px",
        width: "18px",
      },
    },
    mdIcon: {
      width: "40px",
      height: "40px",
      padding: 8,
    },
    label: {
      color: ({ color = "text" }: IconProps) => colors[color],
      fontSize: "10px",
      fontWeight: 300,
      lineHeight: "15px",
      textAlign: "left",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    },
  };
});

const Icon: FC<IconProps> = (props) => {
  const classes = useStyles(props);
  const { size = "md", variant = "default", ...others } = props;

  return (
    <div className={classes.wrapper}>
      <span
        className={clsx(classes.root, {
          [classes.defaultIcon]: variant === "default",
          [classes.containedIcon]: variant === "contained",
          [classes.hoverIcon]: variant === "hover",
          [classes.xsIcon]: size === "xs",
          [classes.smIcon]: size === "sm",
          [classes.mdIcon]: size === "md",
        })}
      >
        {others.children}
      </span>
      {others.label && <span className={classes.label}>{others.label}</span>}
    </div>
  );
};

export default Icon;
