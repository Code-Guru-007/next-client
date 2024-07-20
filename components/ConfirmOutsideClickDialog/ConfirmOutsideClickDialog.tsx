import React, { FC } from "react";
import { useSelector } from "react-redux";
import AlertDialog, {
  AlertDialogProps,
} from "@eGroupAI/material-module/AlertDialog";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "CONFIRM_OUTSIDE_CLICK_DIALOG";

type ExtendStateProps = {
  onConfirm: () => void;
  onClose: () => void;
  primary: string;
  message: string;
  isLoading: boolean;
  loading: boolean;
  isDeleting?: boolean;
};

const ConfirmOutsideClickDialog: FC<AlertDialogProps> = function () {
  const { onConfirm, onClose, isOpen, primary, message, isLoading } =
    useReduxDialog<ExtendStateProps>(DIALOG);
  const wordLibrary = useSelector(getWordLibrary);

  return (
    <AlertDialog
      onCancelClick={onClose}
      onConfirmClick={() => {
        if (onConfirm) {
          onConfirm();
        }
      }}
      open={isOpen}
      primary={primary}
      message={message}
      loading={isLoading}
      variant="dialog"
      recommendAction="no"
      confirmButtonText={wordLibrary?.sure ?? "儲存"}
      cancelButtonText={wordLibrary?.cancel ?? "取消"}
    />
  );
};

export default ConfirmOutsideClickDialog;
