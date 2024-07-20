import React, { FC, useEffect, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import apis from "utils/apis";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import TextField from "@eGroupAI/material/TextField";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { UploadFile } from "interfaces/entities";

export const DIALOG = "UserUploadFileDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface UserUploadFileDialogProps {
  orgPartnerId: string;
  data?: UploadFile;
}

const UserUploadFileDialog: FC<UserUploadFileDialogProps> = function (props) {
  const { orgPartnerId, data } = props;
  const classes = useStyles();
  const theme = useTheme();
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const { excute: updateOrgFileName, isLoading } = useAxiosApiWrapper(
    apis.org.updateOrgFileName
  );
  const [uploadFileName, setUploadFileName] = useState("");
  const matchMutate = useSwrMatchMutate();

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
        {wordLibrary?.edit ?? "編輯"}
      </DialogTitle>
      <DialogContent>
        <TextField
          value={uploadFileName}
          onChange={(e) => {
            setUploadFileName(e.target.value);
          }}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
        <DialogConfirmButton
          loading={isLoading}
          onClick={async () => {
            if (data) {
              try {
                await updateOrgFileName({
                  organizationId,
                  uploadFileId: data.uploadFileId,
                  uploadFileName,
                });
                closeDialog();
                matchMutate(
                  new RegExp(
                    `^/organizations/${organizationId}/users/${orgPartnerId}\\?`,
                    "g"
                  )
                );
              } catch (error) {
                apis.tools.createLog({
                  function: "updateOrgFileName: error",
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
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default UserUploadFileDialog;
