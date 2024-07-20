import React, { FC } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";

import Typography from "@eGroupAI/material/Typography";
import CopyTextField from "@eGroupAI/material/CopyTextField";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { getOrgShare } from "redux/createUserInfoFilledUrlDialog/selectors";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "CopyUrlDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface CopyUrlDialogProps {
  onConfirm?: () => void;
}

const CopyUrlDialog: FC<CopyUrlDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { onConfirm } = props;
  const classes = useStyles();
  const theme = useTheme();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const orgShare = useSelector(getOrgShare);

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
      <DialogTitle onClickClose={closeDialog}>分享填寫連結</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          您可以直接分享連結或是透過簡訊發送連結。
        </Typography>
        {orgShare && (
          <CopyTextField
            margin="dense"
            value={`https://${window.location.host}/reurl/${orgShare.organizationShareShortUrl}`}
            onCopy={() => {
              openSnackbar({
                message: wordLibrary?.["copy successful"] ?? "複製成功",
                severity: "success",
              });
            }}
            variant="outlined"
            fullWidth
          />
        )}
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
        <DialogConfirmButton
          onClick={() => {
            closeDialog();
            if (onConfirm) {
              onConfirm();
            }
          }}
        >
          透過簡訊分享
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default CopyUrlDialog;
