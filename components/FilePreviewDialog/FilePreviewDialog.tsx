import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogContent from "@eGroupAI/material/DialogContent";
import { FC } from "react";
import { styled } from "@eGroupAI/material/styles";

const StyledIframe = styled("iframe")({
  width: "100%",
  height: "80vh",
  border: "none",
});

interface FilePreviewDialogProps {
  filePreviewUrl: string | null;
  onClose: () => void;
  open: boolean;
}

/**
 * Dialog component to preview a file
 */
const FilePreviewDialog: FC<FilePreviewDialogProps> = ({
  open,
  onClose,
  filePreviewUrl,
}) => (
  <Dialog open={open} fullWidth onClose={onClose} maxWidth="md">
    <DialogTitle onClickClose={onClose}>File Preview</DialogTitle>
    <DialogContent>
      {filePreviewUrl && (
        <StyledIframe src={filePreviewUrl} title="File Preview" />
      )}
    </DialogContent>
  </Dialog>
);

export default FilePreviewDialog;
