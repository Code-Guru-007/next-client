import React, { FC, MouseEventHandler, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  ButtonProps,
  DialogActionsProps,
  DialogContentProps,
  DialogTitleProps,
  DialogContentTextProps,
  DialogProps,
} from "@eGroupAI/material";
import { useSelector } from "react-redux";
import DialogTitle from "@mui/material/DialogTitle";
import LoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export interface ConfirmDialogProps extends Omit<DialogProps, "open"> {
  handleClose?: () => void;
  isOpen?: boolean;
  open?: DialogProps["open"];
  primary?: ReactNode | string;
  message?: ReactNode | string;
  onCancel?: MouseEventHandler<HTMLButtonElement>;
  onConfirm?: MouseEventHandler<HTMLButtonElement>;
  disableCloseOnConfirm?: boolean;
  MuiDialogTitleProps?: DialogTitleProps;
  MuiDialogContentProps?: DialogContentProps;
  MuiDialogContentTextProps?: DialogContentTextProps;
  MuiDialogActionsProps?: DialogActionsProps;
  MuiCancelButtonProps?: ButtonProps;
  MuiConfirmButtonProps?: LoadingButtonProps;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen = false,
  primary,
  message,
  children,
  handleClose,
  onClose,
  onCancel,
  onConfirm,
  open,
  disableCloseOnConfirm,
  MuiDialogTitleProps = {},
  MuiDialogContentTextProps = {},
  MuiDialogContentProps = {},
  MuiDialogActionsProps = {},
  MuiCancelButtonProps = {},
  MuiConfirmButtonProps = {},
  ...other
}) => {
  const handleDialogClose: DialogProps["onClose"] = (e, reason) => {
    if (handleClose) {
      handleClose();
    }
    if (onClose) {
      onClose(e, reason);
    }
  };

  const wordLibrary = useSelector(getWordLibrary);

  const handleCancelClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (handleClose) {
      handleClose();
    }
    if (onCancel) {
      onCancel(e);
    }
  };

  const handleConfirmClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!disableCloseOnConfirm && handleClose) {
      handleClose();
    }
    if (onConfirm) {
      onConfirm(e);
    }
  };

  return (
    <Dialog
      open={open ?? isOpen}
      onClose={handleDialogClose}
      {...other}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle {...MuiDialogTitleProps}>{primary}</DialogTitle>
      <DialogContent {...MuiDialogContentProps}>
        {message && (
          <DialogContentText {...MuiDialogContentTextProps}>
            {message}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      <DialogActions {...MuiDialogActionsProps}>
        <Button
          onClick={handleCancelClick}
          color="primary"
          {...MuiCancelButtonProps}
          id="dialog-cancel-button"
        >
          {wordLibrary?.cancel ?? "取消"}
        </Button>
        <LoadingButton
          onClick={handleConfirmClick}
          color="primary"
          id="dialog-confirm-button"
          {...MuiConfirmButtonProps}
        >
          {wordLibrary?.sure ?? "確定"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
