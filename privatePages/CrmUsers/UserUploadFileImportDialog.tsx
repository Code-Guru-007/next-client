import React, { FC } from "react";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Dialog from "@eGroupAI/material/Dialog";
import DialogCloseButton from "components/DialogCloseButton";
import { CircularProgress } from "@eGroupAI/material";

import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import Stack from "@mui/material/Stack";
import DialogActions from "@mui/material/DialogActions";
import { Upload } from "minimal/components/upload";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
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
  description: {
    fontFamily: "Poppins",
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: "18px",
    lineHeight: "22px",
    textAlign: "center",
    [theme.breakpoints.down("sm")]: {
      fontSize: "15px",
    },
    marginBottom: "15px",
  },
}));

export interface UserUploadFileImportDialogProp {
  isOpen?: boolean;
  uploading?: boolean;
  inputEl?: React.RefObject<HTMLInputElement>;
  handleUpload?: (args: File[]) => Promise<void>;
  closeDialog?: () => void;
}

const UserUploadFileImportDialog: FC<UserUploadFileImportDialogProp> = (
  props
) => {
  const classes = useStyles(props);
  const theme = useTheme();

  const {
    isOpen = false,
    uploading = false,
    handleUpload: handleUploadFileProp,
    closeDialog,
  } = props;

  const downloadAddress =
    "https://cdn.egroup-infocenter.com/resources/template/import-user/template.xlsx";

  const handleUploadFile = (uploadFiles: File[]) => {
    if (handleUploadFileProp) {
      handleUploadFileProp(uploadFiles);
    }
  };

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <Dialog
      open={isOpen}
      maxWidth="sm"
      onClose={closeDialog}
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.["please select a file to upload"] ?? "請選擇檔案上傳"}
      </DialogTitle>
      <Stack
        spacing={3}
        sx={{ px: 3, py: 1, maxHeight: 480, overflow: "auto" }}
      >
        <div className={clsx(classes.loader, uploading && classes.showLoader)}>
          <CircularProgress />
        </div>
        <Typography
          className={classes.description}
          sx={{ color: "text.primary" }}
        >
          {wordLibrary?.["please confirm the format of the imported data"] ??
            "請確認匯入資料的格式"}
          (
          <Link href={downloadAddress}>
            {wordLibrary?.["sample download"] ?? "範例下載"}
          </Link>
          )
        </Typography>
        <Upload
          onDropAccepted={handleUploadFile}
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
      </Stack>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
      </DialogActions>
    </Dialog>
  );
};

export default UserUploadFileImportDialog;
