import React from "react";

import clsx from "clsx";

import { IconButton, Theme, alpha } from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

const useStyles = makeStyles((theme: Theme) => ({
  buttonContainer: {
    display: "flex",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "transparent",
  },
  button: {
    height: 36,
    width: 36,
    color: alpha(theme.palette.text.primary, 0.87),
    fontSize: 15,
    fontWeight: 400,
    fontFamily: theme.typography.fontFamily,
    "&.MuiIconButton-root:hover": {
      backgroundColor: theme.palette.background.neutral,
    },
  },
  outlined: {
    border: `1px solid ${theme.palette.primary.dark}`,
  },
  filled: {
    "&:hover": {
      backgroundColor: theme.palette.background.neutral,
    },
    backgroundColor: theme.palette.primary.dark,
  },
  contrast: {
    color: theme.palette.primary.contrastText,
  },
  invisible: {
    visibility: "hidden",
  },
}));

export interface DayProps {
  filled: boolean;
  outlined?: boolean;
  disabled: boolean;
  invisible: boolean;
  onClick?: () => void;
  value: number | string;
}

const Day: React.FC<DayProps> = (props) => {
  const classes = useStyles();
  const { disabled, onClick, value, outlined, invisible, filled } = props;
  const handleOnClick = () => {
    try {
      if (onClick) onClick();
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: Day handleOnClick in IconButton onClick",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };
  return (
    <div
      className={clsx(classes.buttonContainer, invisible && classes.invisible)}
    >
      <IconButton
        className={clsx(
          classes.button,
          !disabled && outlined && classes.outlined,
          !disabled && filled && classes.filled,
          !disabled && filled && classes.contrast
        )}
        disabled={disabled}
        onClick={handleOnClick}
        size="large"
      >
        {value}
      </IconButton>
    </div>
  );
};

export default Day;
