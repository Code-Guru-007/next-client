import React, { ReactNode, forwardRef } from "react";

import {
  Snackbar as MuiSnackbar,
  SnackbarProps as MuiSnackbarProps,
} from "@mui/material";
import Alert, { AlertProps } from "@eGroupAI/material/Alert";

export interface SnackbarProps extends Omit<MuiSnackbarProps, "children"> {
  handleClose?: () => void;
  isOpen?: boolean;
  message?: ReactNode;
  severity?: AlertProps["severity"];
  AlertProps?: Omit<AlertProps, "severity">;
  onCloseClick?: AlertProps["onClose"];
}

const Snackbar = forwardRef<unknown, SnackbarProps>((props, ref) => {
  const {
    handleClose,
    onClose,
    onCloseClick,
    isOpen = false,
    message,
    severity,
    action,
    AlertProps,
    ...other
  } = props;

  const handleSnackbarClose: MuiSnackbarProps["onClose"] = (e, reason) => {
    if (handleClose) {
      handleClose();
    }
    if (onClose) {
      onClose(e, reason);
    }
  };

  return (
    <MuiSnackbar
      ref={ref}
      open={isOpen}
      onClose={handleSnackbarClose}
      {...other}
    >
      <Alert
        onClose={(e) => {
          if (handleClose) {
            handleClose();
          }
          if (onCloseClick) {
            onCloseClick(e);
          }
        }}
        severity={severity}
        action={action}
        {...AlertProps}
      >
        {message}
      </Alert>
    </MuiSnackbar>
  );
});

export default Snackbar;
