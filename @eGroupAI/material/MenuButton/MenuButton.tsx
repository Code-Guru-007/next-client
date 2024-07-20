import React, { ReactElement } from "react";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import clsx from "clsx";

export interface MenuButtonProps {
  /**
   * menuButton is sqare or rounded.
   */
  variant?: "normal" | "rounded";
  /**
   * icon of menuButton
   */
  icon: ReactElement;
  /**
   * menu name
   */
  text: string;
  /**
   * is selected menu
   */
  active?: boolean;
}

const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      color: theme.palette.grey[700],
      "&:hover": {
        cursor: "pointer",
      },
      display: "flex",
    },
    normalButton: {
      width: "222px",
      backgroundColor: theme.palette.primary.main,
      padding: "10px 5px",
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
      },
      "&.active": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    roundedButton: {
      borderRadius: "1000px",
      width: "84px",
      backgroundColor: theme.palette.primary.main,
      flexDirection: "column",
      justifyContent: "center",
      padding: "7px 5px",
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
      },
      "&.active": {
        backgroundColor: theme.palette.primary.dark,
        borderRadius: "1000px 0px 0px 1000px",
      },
    },
    normalIconWrapper: {
      display: "flex",
      paddingLeft: "20px",
    },
    roundedIconWrapper: {
      display: "flex",
      justifyContent: "center",
    },
    normalTextWrapper: {
      margin: 0,
      fontWeight: 400,
      fontSize: "15px",
      lineHeight: "22.5px",
      textAlign: "center",
      display: "flex",
      paddingLeft: "18px",
    },
    roundedTextWrapper: {
      margin: 0,
      fontWeight: 400,
      fontSize: "10px",
      lineHeight: "15px",
      textAlign: "center",
    },
  }),
  { name: "MuiEgMenuButton" }
);

const MenuButton = (props: MenuButtonProps) => {
  const classes = useStyles(props);
  const { variant = "normal", active, ...others } = props;
  return (
    <div
      className={clsx(classes.root, {
        [classes.normalButton]: variant === "normal",
        [classes.roundedButton]: variant === "rounded",
        active,
      })}
    >
      <div
        className={clsx({
          [classes.normalIconWrapper]: variant === "normal",
          [classes.roundedIconWrapper]: variant === "rounded",
        })}
      >
        {others.icon}
      </div>
      <p
        className={clsx({
          [classes.normalTextWrapper]: variant === "normal",
          [classes.roundedTextWrapper]: variant === "rounded",
        })}
      >
        {others.text}
      </p>
    </div>
  );
};

export default MenuButton;
