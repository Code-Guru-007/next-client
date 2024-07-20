import React, { FC, useEffect, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { AxiosError } from "axios";
import apis from "utils/apis";
import { useRouter } from "next/router";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";

import {
  Avatar,
  Box,
  Button,
  Divider,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from "@eGroupAI/material";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { Member } from "@eGroupAI/typings/apis";

import GoogleIcon from "public/google.svg";
import FacebookIcon from "public/facebook.svg";

export interface DeleteAccountDialogProps {
  memberInfo?: Member;
  onDownloadMember: () => void | Promise<void | string>;
  verified?: string | null;
}

export const DIALOG = "AccountDeleteDialog";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  itemContent: {
    display: "flex",
    minWidth: "250px",
    whiteSpace: "nowrap",
    alignItems: "center",
    marginBottom: "20px",
  },
  avatarWrapper: {
    display: "flex",
    justifyContent: "center",
    minWidth: "50px",
    marginRight: "5px",
  },
  nameAvatar: {
    background: theme.palette.primary.main,
    width: 40,
    height: 40,
    fontSize: theme.typography.pxToRem(14),
  },
}));

const DeleteAccountDialog: FC<DeleteAccountDialogProps> = (props) => {
  const classes = useStyles(props);
  const theme = useTheme();
  const router = useRouter();
  const { memberInfo, onDownloadMember, verified: verifiedProp } = props;

  const { isOpen, openDialog, closeDialog } = useReduxDialog(DIALOG);
  const [dialogBackOpen, setDialogBackOpen] = useState<boolean>(false);

  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const firstName = memberInfo?.memberName.split(" ")[0];
  const secondName = memberInfo?.memberName.split(" ")[1];
  let fLetter: string | undefined;
  let sLetter: string | undefined;
  if (firstName) fLetter = firstName[0] as string;
  if (secondName) sLetter = secondName[0] as string;
  const avatarLetters = fLetter?.concat(sLetter || "");

  const [verified, setVerified] = useState<string | null | undefined>(
    verifiedProp
  );

  const [activeStep, setActiveStep] = useState<number>(0);
  const [memberPassword, setPassword] = useState<string>("");
  const [pswErrorMsg, setPswErrorMsg] = useState<string>("");
  const wordLibrary = useSelector(getWordLibrary);

  const primary = "刪除帳號";
  const description = activeStep === 0 ? "" : "確認刪除帳號與輸入現有密碼";
  const delPrimary = activeStep === 0 ? "說明" : "";
  const delDescription =
    activeStep === 0
      ? "注意!如您想刪除帳號及無法復原，刪除程序一旦開始即無法截去過去資訊 因此您可再刪除帳號前前往下載帳號資訊"
      : "";
  const downloadPrimary = activeStep === 0 ? "下載資訊" : "";
  const downloadDescription =
    activeStep === 0
      ? "注意!如您想刪除帳號及無法復原，刪除程序一旦開始即無法截去過去資訊 因此您可再刪除帳號前前往下載帳號資訊"
      : "";
  const deleteVerifyPrimary = "確認刪除帳號";
  const deleteVerifyDescription =
    "您即將永久刪除自己的帳號，如果悠已準備好刪除除帳號，請點選選「删除帳號，提交刪除帳號的要求後，您有 30 天的時間可重新啟用帳號和取消刪除動作。30天後，系統就會開始刪刪除程序，屆時您就無法擷取過去的任何內容或資訊";

  useEffect(() => {
    setVerified(verifiedProp);
  }, [verifiedProp]);

  useEffect(() => {
    if (verified === null || verified === undefined) {
      setActiveStep(0);
      setDialogBackOpen(false);
    } else if (verified === "0") {
      setActiveStep(1);
      setDialogBackOpen(true);
    } else if (verified === "1") {
      setActiveStep(2);
      setDialogBackOpen(true);
    } else {
      setActiveStep(1);
      setDialogBackOpen(true);
      openSnackbar({
        message: verified,
        severity: "error",
      });
    }
    return () => {
      setDialogBackOpen(false);
    };
  }, [openDialog, openSnackbar, verified]);

  const { excute: getGoogleLoginUrl, isLoading: isGoogleLogin } =
    useAxiosApiWrapper(apis.member.getGoogleLoginUrl, "None");

  const { excute: getFbLoginUrl, isLoading: isFbLogin } = useAxiosApiWrapper(
    apis.member.getFbLoginUrl,
    "None"
  );

  const { excute: verifyAccountByPassword, isLoading: isPasswordLogin } =
    useAxiosApiWrapper(apis.member.verifyAccountByPassword, "Update");

  const handleCloseDialog = () => {
    closeDialog();
    setActiveStep(0);
    setDialogBackOpen(false);
  };

  const handleGoogleLogin = () => {
    getGoogleLoginUrl()
      .then((response) => {
        window.localStorage.setItem("loginRedirectURL", router.pathname);
        window.open(response.data as string, "_self");
      })
      .catch(() => {});
  };

  const handleFbLogin = () => {
    getFbLoginUrl()
      .then((response) => {
        window.open(response.data as string, "_self");
      })
      .catch(() => {});
  };

  const handleLogoutWithDeletion = async () => {
    window.localStorage.setItem("onDeleteAccountRequest", "1");
    router.replace("/login");
  };

  const handlePasswordLogin = () => {
    if (memberPassword === "") {
      setPswErrorMsg("Password should not be empty!");
    } else
      try {
        verifyAccountByPassword({ memberPassword })
          .then((res) => {
            if (res.status === 200) {
              setVerified("1");
            } else setVerified("0");
          })
          .catch((err: AxiosError) => {
            setVerified(`Error: Request failed`);
            setPswErrorMsg(err.response?.data.message);
          });
      } catch (error) {
        apis.tools.createLog({
          function: "verifyAccountByPassword: error",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
  };

  return (
    <Dialog
      open={isOpen || dialogBackOpen}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={handleCloseDialog}>
        <Typography variant="h3" color="text" marginBottom={2} marginTop={2}>
          {activeStep !== 2 ? primary : deleteVerifyPrimary}
        </Typography>
        <Box flexGrow={1} />
        {activeStep === 1 && (
          <Typography variant="body1" marginBottom={3}>
            {description}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {activeStep === 0 && (
          <>
            <Typography variant="h4" color="text" marginBottom={2}>
              {delPrimary}
            </Typography>
            <Typography variant="body1" marginBottom={3}>
              {delDescription}
            </Typography>
            <Divider />
            <Typography
              variant="h4"
              color="text"
              marginBottom={2}
              marginTop={3}
            >
              {downloadPrimary}
            </Typography>
            <Typography variant="body1" marginBottom={3}>
              {downloadDescription}
            </Typography>
          </>
        )}
        {activeStep === 1 && (
          <>
            <Box className={classes.itemContent}>
              <ListItemAvatar className={classes.avatarWrapper}>
                <Avatar className={classes.nameAvatar}>
                  {avatarLetters?.toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText>{memberInfo?.memberName}</ListItemText>
            </Box>
            {memberInfo?.hasMemberPassword && (
              <TextField
                label="輸入目前密碼"
                value={memberPassword}
                fullWidth
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                name="password"
                type="password"
                disabled={Boolean(!memberInfo?.hasMemberPassword)}
                error={Boolean(pswErrorMsg)}
                helperText={pswErrorMsg}
                sx={{
                  flex: 1,
                  margin: "10px 0px",
                }}
              />
            )}
            {memberInfo?.memberGoogleId && (
              <>
                <Button
                  fullWidth
                  rounded
                  color="white"
                  size="small"
                  variant="outlined"
                  loading={isGoogleLogin}
                  disabled={isGoogleLogin}
                  onClick={handleGoogleLogin}
                  startIcon={<GoogleIcon />}
                  style={{ margin: "10px 0px", fontSize: "20px" }}
                >
                  Sign In with Google
                </Button>
                <Button
                  fullWidth
                  rounded
                  color="white"
                  size="small"
                  variant="outlined"
                  loading={isFbLogin}
                  disabled={isFbLogin || true}
                  onClick={handleFbLogin}
                  startIcon={<FacebookIcon />}
                  style={{ margin: "10px 0px", fontSize: "20px" }}
                >
                  Sign In with Facebook
                </Button>
              </>
            )}
          </>
        )}
        {activeStep === 2 && (
          <Typography variant="body1" marginBottom={3}>
            {deleteVerifyDescription}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={handleCloseDialog} />
        {activeStep === 1 && memberInfo?.hasMemberPassword && (
          <DialogConfirmButton
            onClick={handlePasswordLogin}
            loading={isPasswordLogin}
            disabled={isPasswordLogin}
            color="primary"
          >
            Verify by password
          </DialogConfirmButton>
        )}
        {activeStep !== 1 && (
          <DialogConfirmButton
            onClick={() => {
              if (activeStep === 2) {
                handleLogoutWithDeletion();
              } else if (activeStep < 2) setActiveStep(activeStep + 1);
            }}
            color="error"
          >
            {wordLibrary?.delete ?? "刪除"}
          </DialogConfirmButton>
        )}
        {activeStep === 0 && (
          <DialogConfirmButton
            onClick={() => {
              onDownloadMember();
            }}
          >
            {wordLibrary?.download ?? "下載"}
          </DialogConfirmButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountDialog;
