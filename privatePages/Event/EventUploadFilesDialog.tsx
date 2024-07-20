import { useEffect, useState, useCallback } from "react";
// @mui
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Dialog, { DialogProps } from "@mui/material/Dialog";
// components
import Iconify from "minimal/components/iconify";
import { Upload } from "minimal/components/upload";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useFileEvents from "utils/useFileEvents";
import { OrganizationEvent } from "interfaces/entities";
import {
  ServiceModuleValue,
  OrganizationMediaSizeType,
} from "interfaces/utils";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  title?: string;
  event?: OrganizationEvent;
  onUpdateEvent?: (values: { [key: string]: any }) => void;
  //
  // folderName?: string;
  // onChangeFolderName?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  //
  open: boolean;
  onClose: VoidFunction;
  // onUploadSuccess?: () => void;
}

export default function EventUploadFilesDialog({
  title = "上傳檔案",
  event,
  onUpdateEvent,
  open,
  onClose,
}: // folderName,
// onChangeFolderName,
// onUploadSuccess,
// ...other
Props) {
  const [files, setFiles] = useState<(File | string)[]>([]);
  const wordLibrary = useSelector(getWordLibrary);
  const { handleUploadFile } = useFileEvents({ useImageCompressUpload: false });
  const classes = useStyles();
  const theme = useTheme();

  useEffect(() => {
    if (!open) {
      setFiles([]);
    }
  }, [open]);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles([...files, ...newFiles]);
    },
    [files]
  );

  const handleUpload = () => {
    onClose();
    if (files) {
      handleUploadFile({
        files: Array.from(files as File[]),
        filePathType: ServiceModuleValue.EVENT,
        imageSizeType: OrganizationMediaSizeType.NORMAL,
        targetId: event?.organizationEventId,
        onUploadSuccess: (data) => {
          if (onUpdateEvent && data[0]) {
            onUpdateEvent({
              uploadFileList: event?.uploadFileList
                ?.map((el) => ({
                  uploadFileId: el.uploadFileId,
                }))
                .concat([
                  {
                    uploadFileId: data[0]?.uploadFileId,
                  },
                ]),
            });
          }
        },
      });
    }
  };

  const handleRemoveFile = (inputFile: File | string) => {
    const filtered = files.filter((file) => file !== inputFile);
    setFiles(filtered);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle
        sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}
        onClickClose={onClose}
      >
        {title}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: "none" }}>
        <Upload
          multiple
          files={files}
          onDrop={handleDrop}
          onRemove={handleRemoveFile}
          onDelete={() => setFiles([])}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          onClick={handleUpload}
        >
          {wordLibrary?.upload ?? "上傳"}
        </Button>

        {!!files.length && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleRemoveAllFiles}
          >
            移除所有
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
