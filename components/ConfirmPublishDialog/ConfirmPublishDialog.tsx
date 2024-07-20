import React, { FC } from "react";
import { useSelector } from "react-redux";

import AlertDialog, {
  AlertDialogProps,
} from "@eGroupAI/material-module/AlertDialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";

export const DIALOG = "CONFIRM_PUBLISH_DIALOG";

type ExtendStateProps = {
  onConfirm: () => void;
  primary: string;
};

const ConfirmPublishDialog: FC<AlertDialogProps> = function () {
  const { closeDialog, onConfirm, isOpen, primary } =
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
      primary={primary}
      variant="dialog"
      recommendAction="no"
      confirmButtonText={wordLibrary?.sure ?? "確定"}
      cancelButtonText={wordLibrary?.cancel ?? "取消"}
    />
  );
};

export default ConfirmPublishDialog;
