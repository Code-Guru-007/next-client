import React, { FC } from "react";
import { useSelector } from "react-redux";

import AlertDialog, {
  AlertDialogProps,
} from "@eGroupAI/material-module/AlertDialog";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";

export const DIALOG = "CONFIRM_LEAVE_DIALOG";

type ExtendStateProps = {
  onConfirm: () => void;
};

const ConfirmLeaveDialog: FC<AlertDialogProps> = function () {
  const { closeDialog, isOpen, onConfirm } =
    useReduxDialog<ExtendStateProps>(DIALOG);
  const wordLibrary = useSelector(getWordLibrary);
  return (
    <AlertDialog
      onClose={closeDialog}
      onCancelClick={closeDialog}
      onConfirmClick={() => {
        if (onConfirm) {
          onConfirm();
        }
      }}
      open={isOpen}
      primary={wordLibrary?.edit ?? "編輯"}
      message={
        wordLibrary?.["are you sure you want to leave ?"] ?? "你確定要離開嗎？"
      }
      variant="dialog"
      recommendAction="no"
      confirmButtonText={wordLibrary?.sure ?? "確定"}
      cancelButtonText={wordLibrary?.cancel ?? "取消"}
    />
  );
};

export default ConfirmLeaveDialog;
