import React, { FC, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";

import { useReduxDialog } from "@eGroupAI/redux-modules";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogConfirmButton from "components/DialogConfirmButton";
import PreviewFilledUserInfo from "publicPages/FilledUserInfo/PreviewFilledUserInfo";

export const DIALOG = "PreviewUserInfoFilledDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface PreviewUserInfoFilledDialogProps {
  organizationShareShortUrl: string;
}

const PreviewUserInfoFilledDialog: FC<PreviewUserInfoFilledDialogProps> =
  function (props) {
    const { organizationShareShortUrl } = props;
    const classes = useStyles();
    const theme = useTheme();
    const [step, setStep] = useState<number>();
    const { closeDialog, isOpen } = useReduxDialog(DIALOG);

    return (
      <Dialog
        open={isOpen}
        onClose={() => {
          setStep(undefined);
          closeDialog();
        }}
        maxWidth="md"
        fullWidth
        className={classes.dialogPaper}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle
          onClickClose={() => {
            setStep(undefined);
            closeDialog();
          }}
        >
          預覽用戶訊息填寫
        </DialogTitle>
        <DialogContent>
          <PreviewFilledUserInfo
            organizationShareShortUrl={organizationShareShortUrl}
            step={step}
            changeStep={setStep}
          />
        </DialogContent>
        <DialogActions>
          <DialogConfirmButton
            onClick={() => {
              setStep(undefined);
              closeDialog();
            }}
            rounded
          >
            返回
          </DialogConfirmButton>
        </DialogActions>
      </Dialog>
    );
  };

export default PreviewUserInfoFilledDialog;
