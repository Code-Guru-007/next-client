import React, { FC } from "react";
import { useSelector } from "react-redux";

import AlertDialog, {
  AlertDialogProps,
} from "@eGroupAI/material-module/AlertDialog";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "CONFIRM_DIALOG";

type ExtendStateProps = {
  onConfirm: () => void;
  primary: string;
  message: string;
  onCancel?: () => void;
};

const ConfirmDialog: FC<AlertDialogProps> = function () {
  const { closeDialog, onConfirm, isOpen, primary, message, onCancel } =
    useReduxDialog<ExtendStateProps>(DIALOG);
  const wordLibrary = useSelector(getWordLibrary);

  return (
    <AlertDialog
    onClose={closeDialog}
    
    onCancelClick={() => {
      if (onCancel) onCancel();
        closeDialog();
      }}
      onConfirmClick={() => {
        if (onConfirm) {
          onConfirm();
        }
      }}
      open={isOpen}
      primary={primary}
      message={message}
      variant="dialog"
      recommendAction="yes"
      confirmButtonText={wordLibrary?.sure ?? "確定"}
      cancelButtonText={wordLibrary?.cancel ?? "取消"}
    />
  );
};

export default ConfirmDialog;
