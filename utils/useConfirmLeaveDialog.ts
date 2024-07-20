/* eslint-disable no-param-reassign */
import { useCallback, useEffect } from "react";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { DIALOG as CONFIRM_LEAVE_DILAOG } from "components/ConfirmLeaveDialog";

export type UseConfirmLeaveDialogArgs = {
  /**
   * Return value for handle beforeunload
   */
  returnValue?: string;
  /**
   * Should open confirm dialog or not
   */
  shouldOpen: boolean;
  /**
   * Close event callback when shouldOpen is false.
   */
  handleClose?: () => void;
  /**
   * Confirm event callback when confirm dialog leave.
   */
  onConfirm?: () => void;
};

export default function useConfirmLeaveDialog({
  returnValue = "確定離開嗎？您將遺失您的資料",
  shouldOpen,
  handleClose,
  onConfirm,
}: UseConfirmLeaveDialogArgs) {
  const { openDialog, closeDialog } = useReduxDialog(CONFIRM_LEAVE_DILAOG);

  const closeConfirm = useCallback(
    (cb?: () => void) => {
      if (shouldOpen) {
        openDialog({
          onConfirm: () => {
            closeDialog();
            if (cb) {
              cb();
            } else if (onConfirm) {
              onConfirm();
            }
          },
        });
      } else if (handleClose) {
        handleClose();
      }
    },
    [shouldOpen, handleClose, openDialog, closeDialog, onConfirm]
  );

  useEffect(() => {
    const handleBeforeunload = (event: BeforeUnloadEvent) => {
      // Chrome requires `returnValue` to be set.
      if (event.defaultPrevented) {
        event.returnValue = "";
      }
      event.returnValue = returnValue;
      return returnValue;
    };
    if (shouldOpen) {
      window.addEventListener("beforeunload", handleBeforeunload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeunload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeunload);
    };
  }, [returnValue, shouldOpen]);

  return closeConfirm;
}
