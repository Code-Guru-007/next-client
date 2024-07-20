import React, { FC } from "react";
import { useSelector } from "react-redux";

import AlertDialog, {
  AlertDialogProps,
} from "@eGroupAI/material-module/AlertDialog";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "CONFIRM_DELETE_DIALOG";

type ExtendStateProps = {
  onConfirm: () => void;
  onStore?: () => void;
  primary: string;
  deletableName?: string;
  isDeleting?: boolean;
};

const ConfirmDeleteDialog: FC<AlertDialogProps> = function () {
  const {
    closeDialog,
    onConfirm,
    isOpen,
    primary,
    deletableName,
    isDeleting,
    onStore,
  } = useReduxDialog<ExtendStateProps>(DIALOG);
  const wordLibrary = useSelector(getWordLibrary);

  return (
    <AlertDialog
      onClose={closeDialog}
      deletableName={deletableName}
      onCancelClick={closeDialog}
      onConfirmClick={() => {
        if (onConfirm) {
          onConfirm();
        }
      }}
      onStoreClick={onStore}
      open={isOpen}
      primary={primary}
      loading={isDeleting}
      variant="dialog"
      recommendAction="no"
      storeButtonText={onStore && "keep member in event"}
      confirmButtonText={
        onStore ? "remove from event" : wordLibrary?.sure ?? "確定"
      }
      cancelButtonText={wordLibrary?.cancel ?? "取消"}
    />
  );
};

export default ConfirmDeleteDialog;
