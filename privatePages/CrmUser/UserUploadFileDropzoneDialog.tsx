import React, { FC, useCallback, useState, useEffect } from "react";
import { Upload } from "minimal/components/upload";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import { DialogContent } from "@eGroupAI/material";
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Iconify from "minimal/components/iconify";
import {
  OrganizationMediaSizeType,
  ServiceModuleValue,
} from "interfaces/utils";
import useFileEvents from "utils/useFileEvents";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  dialog: {
    borderRadius: 0,
  },
  dialogHeader: {
    padding: "30px 30px 30px 56px",
  },
  dialogContent: {
    position: "relative",
    overflowY: "unset",
    padding: "0px 55px 50px 55px",
    display: "flex",
    height: "400px",
  },
  dropzone: {
    "--border-color": theme.palette.grey[300],

    flexBasis: "100%",
    color: theme.palette.grey[300],
  },
  actions: {
    padding: "30px",
  },
  loader: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: "none",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
}));

interface Props extends DialogProps {
  title?: string;
  orgUserId: string;
  open: boolean;
  onClose: VoidFunction;
}

const UserUploadFileDropzoneDialog: FC<Props> = ({
  title = "上傳文件",
  orgUserId,
  open,
  onClose,
  // ...other
}) => {
  const [files, setFiles] = useState<(File | string)[]>([]);
  const classes = useStyles();
  const theme = useTheme();
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const matchMutate = useSwrMatchMutate();
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

      setFiles([...files, ...newFiles]);
    },
    [files]
  );

  const handleUpload = () => {
    onClose();
    if (files) {
      handleUploadFile({
        files: Array.from(files as File[]),
        filePathType: ServiceModuleValue.USER_FILE,
        imageSizeType: OrganizationMediaSizeType.NORMAL,
        targetId: orgUserId,
        onSuccess: () => {
          matchMutate(
            new RegExp(
              `^/organizations/${organizationId}/users/${orgUserId}\\?`,
              "g"
            )
          );
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
          files={files}
          multiple
          onDrop={handleDrop}
          onRemove={handleRemoveFile}
          onDelete={() => setFiles([])}
        />
      </DialogContent>
      <DialogActions>
        {!!files.length && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleRemoveAllFiles}
          >
            移除所有
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          onClick={handleUpload}
        >
          {wordLibrary?.upload ?? "上傳"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserUploadFileDropzoneDialog;
