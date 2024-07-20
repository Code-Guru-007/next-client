import React, { forwardRef } from "react";
import { AlertProps as MuiAlertProps } from "@mui/lab";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Icon from "@mui/material/Icon";
import { Alert as AlertBase } from "@mui/material";

import IconButton from "@eGroupAI/material/IconButton";

import AlertDialog from "../AlertDialog";
import AlertRound from "../AlertRound";

export interface AlertProps extends Omit<MuiAlertProps, "shape"> {
  /**
   * alert shape: round: AlertRounded, dialog: AlertDialog, undefined: AlertBase
   * @default undefined
   */
  shape?: "dialog" | "round";
  /**
   * in case of shape is round. size of alert.
   * @default small
   */
  roundSize?: "small" | "medium";
}

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  const {
    shape,
    roundSize = "small",
    onClose,
    action = (
      <IconButton color="inherit" size="small" onClick={onClose}>
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    ),
    iconMapping = {
      success: <TaskAltRoundedIcon />,
      info: <Icon className="material-icons-round">info_outline</Icon>,
      warning: <WarningAmberRoundedIcon />,
      error: <HighlightOffRoundedIcon />,
    },
    ...other
  } = props;
  if (shape === "dialog") {
    return (
      <AlertDialog
        action={action}
        iconMapping={iconMapping}
        ref={ref}
        {...other}
      />
    );
  }
  if (shape === "round") {
    return (
      <AlertRound
        action={action}
        iconMapping={iconMapping}
        ref={ref}
        size={roundSize}
        {...other}
      />
    );
  }
  return (
    <AlertBase
      action={action}
      sx={{ minWidth: "300px" }}
      ref={ref}
      {...other}
    />
  );
});

export default Alert;
