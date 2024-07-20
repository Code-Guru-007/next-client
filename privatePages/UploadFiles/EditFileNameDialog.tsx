import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import TextField from "@eGroupAI/material/TextField";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { UploadFile } from "interfaces/entities";

export const DIALOG = "EditFileNameDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface EditFileNameDialogProps {
  data?: UploadFile;
  onUpdateFileName: (fileId: string, name: string) => void;
  isLoading: boolean;
}

const EditFileNameDialog: FC<EditFileNameDialogProps> = function (props) {
  const { data, onUpdateFileName, isLoading } = props;
  const theme = useTheme();
  const classes = useStyles();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [uploadFileName, setUploadFileName] = useState("");
  const wordLibrary = useSelector(getWordLibrary);

  useEffect(() => {
    if (data) {
      setUploadFileName(data.uploadFileName);
    }
  }, [data]);

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.["edit file name"] ?? "編輯檔案名稱"}
      </DialogTitle>
      <DialogContent>
        <TextField
          value={uploadFileName}
          onChange={(e) => {
            setUploadFileName(e.target.value);
          }}
          fullWidth
          sx={{ mt: 1 }}
          id="edit-filename-input"
          data-tid="edit-filename-input"
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
        <DialogConfirmButton
          loading={isLoading}
          onClick={async () => {
            if (data) {
              try {
                await onUpdateFileName(data.uploadFileId, uploadFileName);
                closeDialog();
              } catch (error) {
                apis.tools.createLog({
                  function: "onUpdateFileName: error",
                  browserDescription: window.navigator.userAgent,
                  jsonData: {
                    data: error,
                    deviceInfo: getDeviceInfo(),
                  },
                  level: "ERROR",
                });
              }
            }
          }}
          disabled={isLoading}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditFileNameDialog;
