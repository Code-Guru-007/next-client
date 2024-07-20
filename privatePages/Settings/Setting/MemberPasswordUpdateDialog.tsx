import React, { FC, useEffect, useState } from "react";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@eGroupAI/material/Dialog";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { Box, TextField, Typography } from "@eGroupAI/material";
import DialogFullPageHeader from "components/DialogFullPageHeader";
import DialogFullPageCloseButton from "components/DialogFullPageCloseButton";
import DialogFullPageContainer from "components/DialogFullPageContainer";

export interface MemberPasswordUpdateDialogProps {
  memberHasPassword?: number;
  primary?: string;
  description?: string;
  loading?: boolean;
  onConfirm: (oldPsw: string, newPsw: string) => Promise<number>;
}

export const DIALOG = "MemberPasswordUpdateDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

const MemberPasswordUpdateDialog: FC<MemberPasswordUpdateDialogProps> = (
  props
) => {
  const { primary, description, loading, onConfirm } = props;
  const theme = useTheme();
  const classes = useStyles();
  const { isOpen, closeDialog } = useReduxDialog(DIALOG);

  const [oldPsw, setOldPsw] = useState<string>("");
  const [newPsw, setNewPsw] = useState<string>("");
  const [confirmPsw, setConfirmPsw] = useState<string>("");
  const [oldPswHelpText, setOldPswHelpText] = useState<string>("");
  const [newPswHelpText, setNewPswHelpText] = useState<string>("");
  const [confirmPswHelpText, setConfirmPswHelpText] = useState<string>("");
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const wordLibrary = useSelector(getWordLibrary);

  useEffect(() => {
    if (newPsw !== "" && newPsw.length < 8) {
      setNewPswHelpText("Password must be more than 8 length");
    } else setNewPswHelpText("");
  }, [newPsw]);

  useEffect(() => {
    setOldPswHelpText("");
  }, [oldPsw]);

  useEffect(() => {
    if (confirmPsw !== "" && newPsw !== confirmPsw) {
      setConfirmPswHelpText("Confirmation is not same as Password");
    } else setConfirmPswHelpText("");
  }, [confirmPsw, newPsw]);

  useEffect(() => {
    if (
      newPswHelpText === "" &&
      confirmPswHelpText === "" &&
      newPsw !== "" &&
      newPsw === confirmPsw
    ) {
      setIsValidated(true);
    } else setIsValidated(false);
  }, [oldPswHelpText, newPswHelpText, confirmPswHelpText, newPsw, confirmPsw]);

  const handleResetPassword = async () => {
    const status = await onConfirm(oldPsw, newPsw);
    if (status === 401) {
      setOldPswHelpText("Old Password is incorrect, please try again.");
    }
  };

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
      <DialogFullPageHeader>
        <Box flexGrow={1} />
        <div>
          <DialogFullPageCloseButton
            onClick={closeDialog}
            sx={{ margin: "20px 20px 0px 0px" }}
          />
        </div>
      </DialogFullPageHeader>
      <DialogFullPageContainer>
        <Typography variant="h4" color="text" marginBottom={2}>
          {primary}
        </Typography>
        <Typography variant="body1" marginBottom={3}>
          {description}
        </Typography>
        <TextField
          label="目前密碼"
          value={oldPsw}
          onChange={(e) => {
            setOldPsw(e.target.value);
          }}
          name="oldPassword"
          type="password"
          error={Boolean(oldPswHelpText)}
          helperText={oldPswHelpText}
          fullWidth
          sx={{
            flex: 1,
            margin: "10px 0px",
          }}
        />
        <TextField
          label="新密碼"
          value={newPsw}
          onChange={(e) => {
            setNewPsw(e.target.value);
          }}
          name="newPassword"
          type="password"
          error={Boolean(newPswHelpText)}
          helperText={newPswHelpText}
          fullWidth
          sx={{
            flex: 1,
            margin: "10px 0px",
          }}
        />
        <TextField
          label="確認新密碼"
          value={confirmPsw}
          onChange={(e) => {
            setConfirmPsw(e.target.value);
          }}
          name="confirmPassword"
          type="password"
          error={Boolean(confirmPswHelpText)}
          helperText={confirmPswHelpText}
          fullWidth
          sx={{
            flex: 1,
            margin: "10px 0px",
          }}
        />
      </DialogFullPageContainer>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
        <DialogConfirmButton
          onClick={() => {
            handleResetPassword();
          }}
          loading={loading}
          disabled={loading ?? !isValidated}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default MemberPasswordUpdateDialog;
