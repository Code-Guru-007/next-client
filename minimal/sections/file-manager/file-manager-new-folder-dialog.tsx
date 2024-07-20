import { useEffect, useState, useCallback } from "react";
// @mui
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Dialog, { DialogProps } from "@mui/material/Dialog";
// components
import Iconify from "minimal/components/iconify";
import { Upload } from "minimal/components/upload";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useFileEvents from "utils/useFileEvents";
import { ServiceModuleValue } from "interfaces/utils";

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  title?: string;
  //
  onCreate?: VoidFunction;
  onUpdate?: VoidFunction;
  //
  folderName?: string;
  onChangeFolderName?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  //
  open: boolean;
  onClose: VoidFunction;
  onUploadSuccess?: () => void;
  filePathType?: ServiceModuleValue;
}

export default function FileManagerNewFolderDialog({
  title = "上傳檔案",
  open,
  onClose,
  //
  onCreate,
  onUpdate,
  //
  folderName,
  onChangeFolderName,
  onUploadSuccess,
  filePathType = ServiceModuleValue.FILES,
  ...other
}: Props) {
  const [files, setFiles] = useState<(File | string)[]>([]);
  const [isMultiple] = useState<boolean>(true);
  const wordLibrary = useSelector(getWordLibrary);
  const { handleUploadFile } = useFileEvents({ useImageCompressUpload: false });

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

      if (isMultiple) setFiles([...files, ...newFiles]);
      else setFiles([...newFiles]);
    },
    [files, isMultiple]
  );

  const handleUpload = () => {
    onClose();
    if (files) {
      handleUploadFile({
        files: Array.from(files as File[]),
        filePathType,
        onUploadSuccess,
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
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ p: (theme) => theme.spacing(3, 3, 2, 3) }}>
        {" "}
        {title}{" "}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: "none" }}>
        {(onCreate || onUpdate) && (
          <TextField
            fullWidth
            label="Folder name"
            value={folderName}
            onChange={onChangeFolderName}
            sx={{ mb: 3 }}
          />
        )}

        <Upload
          files={files}
          multiple={isMultiple}
          onDrop={handleDrop}
          onRemove={handleRemoveFile}
        />
      </DialogContent>

      <DialogActions>
        {!!files.length && (
          <Button
            id="file-manager-remove-button"
            variant="outlined"
            color="inherit"
            onClick={handleRemoveAllFiles}
          >
            {wordLibrary?.remove ?? "移除"} {wordLibrary?.all ?? "全部"}
          </Button>
        )}

        <Button
          id="file-manager-upload-button"
          variant="contained"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          onClick={handleUpload}
        >
          {wordLibrary?.upload ?? "上傳"}
        </Button>

        {(onCreate || onUpdate) && (
          <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
            <Button
              id="file-manager-save-add-button"
              variant="soft"
              onClick={onCreate || onUpdate}
            >
              {onUpdate
                ? wordLibrary?.save ?? "儲存"
                : wordLibrary?.add ?? "新增"}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}
