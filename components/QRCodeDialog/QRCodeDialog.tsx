import React from "react";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import QRCode, { QRCodeProps } from "@eGroupAI/material-lab/QRCode";
import { DialogTitle } from "@eGroupAI/material";
import { Dialog, DialogActions, DialogContent } from "@mui/material";

export type QRCodeDialogProps = QRCodeProps;

export const DIALOG = "QRCodeDialog";

export default function QRCodeDialog(props: QRCodeDialogProps) {
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  return (
    <Dialog open={isOpen} onClose={closeDialog}>
      <DialogTitle onClickClose={closeDialog} />
      <DialogContent sx={{ marginTop: 3 }}>
        <QRCode {...props} />
      </DialogContent>
      <DialogActions />
    </Dialog>
  );
}
