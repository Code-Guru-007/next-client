import React, {
  FC,
  ReactNode,
  MouseEventHandler,
  useState,
  useEffect,
} from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  ButtonProps as MuiButtonProps,
  DialogActionsProps,
  DialogContentProps,
  DialogContentTextProps,
  DialogTitleProps,
  DialogProps,
  TextField,
} from "@mui/material";

import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";

interface ButtonProps extends MuiButtonProps {
  /**
   * auto focus button
   * @default false
   */
  focused?: boolean;
}

export interface AlertDialogProps extends Omit<DialogProps, "open"> {
  handleClose?: () => void;
  isOpen?: boolean;
  open?: DialogProps["open"];
  primary?: ReactNode | string;
  deletableName?: string;
  message?: ReactNode | string;
  onConfirm?: MouseEventHandler<HTMLButtonElement>;
  onStoreClick?: MouseEventHandler<HTMLButtonElement>;
  MuiDialogTitleProps?: DialogTitleProps;
  MuiDialogContentProps?: DialogContentProps;
  MuiDialogContentTextProps?: DialogContentTextProps;
  MuiDialogActionsProps?: DialogActionsProps;
  MuiButtonProps?: ButtonProps;
  /**
   * handle click YES button
   */
  onConfirmClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * handle click NO button
   */
  onCancelClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * confirm button text
   * @default Yes
   */
  confirmButtonText?: string;
  storeButtonText?: string;
  /**
   * cancel button text
   * @default No
   */
  cancelButtonText?: string;
  /**
   * confirm or choose YES/NO
   */
  variant?: "confirm" | "dialog";
  /**
   *  which button is auto focus
   */
  recommendAction?: "yes" | "no";
  /**
   * loading status
   */
  loading?: boolean;
}
const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

const AlertDialog: FC<AlertDialogProps> = ({
  isOpen = false,
  primary,
  deletableName,
  message,
  children,
  handleClose,
  onClose,
  onConfirm,
  open,
  MuiDialogTitleProps = {},
  MuiDialogContentTextProps = {},
  MuiDialogContentProps = {},
  MuiDialogActionsProps = {},
  MuiButtonProps = {},
  onConfirmClick,
  onCancelClick,
  confirmButtonText = "Yes",
  cancelButtonText = "No",
  variant = "dialog",
  recommendAction = "no",
  loading,
  onStoreClick,
  storeButtonText = "",
  ...other
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [deletable, setDeletable] = useState(false);
  const [inputValue, setInputValue] = useState<string>();
  const handleDialogClose: DialogProps["onClose"] = (e, reason) => {
    if (handleClose) {
      handleClose();
    }
    if (onClose) {
      onClose(e, reason);
    }
    setDeletable(false);
    setInputValue(undefined);
  };

  useEffect(() => {
    /**
     * string normalize with NFKC
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
     */
    if (inputValue?.normalize("NFKC") === deletableName?.normalize("NFKC"))
      setDeletable(true);
    else setDeletable(false);
  }, [deletableName, inputValue]);

  const handleConfirmClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (handleClose) {
      handleClose();
    }
    if (onConfirm) {
      onConfirm(e);
    }
    setDeletable(false);
    setInputValue(undefined);
  };

  const handleCancelClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (handleClose) {
      handleClose();
    }
    if (onCancelClick) {
      onCancelClick(e);
    }
    setDeletable(false);
    setInputValue(undefined);
  };

  const handleOkClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (handleClose) {
      handleClose();
    }
    if (onConfirmClick) {
      onConfirmClick(e);
    }
    setDeletable(false);
    setInputValue(undefined);
  };

  const handleStoreClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (handleClose) {
      handleClose();
    }
    if (onCancelClick) {
      onCancelClick(e);
    }
    if (onStoreClick) {
      onStoreClick(e);
    }
    setDeletable(false);
    setInputValue(undefined);
  };

  return (
    <Dialog
      open={open ?? isOpen}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
      {...other}
    >
      <DialogTitle {...MuiDialogTitleProps}>{primary}</DialogTitle>
      <DialogContent {...MuiDialogContentProps}>
        {message && (
          <DialogContentText {...MuiDialogContentTextProps}>
            {message}
          </DialogContentText>
        )}
        {children}
        {!!deletableName && (
          <TextField
            id="delete-dialog-name-input"
            data-tid="delete-dialog-name-input"
            variant="standard"
            multiline
            sx={{ width: "100%" }}
            placeholder="請輸入名稱以刪除"
            onChange={(e) => {
              e.preventDefault();
              const { value } = e.target;
              setInputValue(value);
            }}
          />
        )}
      </DialogContent>
      <DialogActions {...MuiDialogActionsProps}>
        {variant === "confirm" && (
          <DialogConfirmButton
            onClick={handleConfirmClick}
            variant="contained"
            {...MuiButtonProps}
          >
            OK
          </DialogConfirmButton>
        )}
        {variant === "dialog" && (
          <>
            <DialogCloseButton
              onClick={handleCancelClick}
              focused={recommendAction === "no"}
              {...MuiButtonProps}
              // disabled={loading}
            >
              {cancelButtonText}
            </DialogCloseButton>
            {storeButtonText && (
              <DialogConfirmButton
                onClick={handleStoreClick}
                disableRipple
                focused={recommendAction === "yes"}
                {...MuiButtonProps}
              >
                {storeButtonText}
              </DialogConfirmButton>
            )}
            <DialogConfirmButton
              onClick={handleOkClick}
              disabled={(!deletable && !!deletableName) || loading}
              loading={loading}
              disableRipple
              focused={recommendAction === "yes"}
              {...MuiButtonProps}
            >
              {confirmButtonText}
            </DialogConfirmButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
