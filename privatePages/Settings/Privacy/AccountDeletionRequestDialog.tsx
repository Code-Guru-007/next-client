import React, { useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import apis from "utils/apis";
import { AxiosError } from "axios";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { useAppDispatch } from "redux/configureAppStore";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import { logout as logoutAction } from "components/PrivateLayout/actions";

import { Typography } from "@eGroupAI/material";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

export const DIALOG = "AccountDeletionRequestDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

const AccountDeletionRequestDialog = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const theme = useTheme();
  const classes = useStyles();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [, , removeCookie] = useCookies();
  const { isOpen, closeDialog } = useReduxDialog(DIALOG);
  const [isCancel, setIsCancel] = useState<boolean>(false);
  const [isRequest, setIsRequest] = useState<boolean>(false);

  const description1 =
    wordLibrary?.[
      "if you wish to cancel the account deletion or retrieve any content or information you added,please click 'cancel deletion'; otherwise,your account will begin to be deleted after 30 days"
    ] ??
    "如果你想取消刪除帳號，或擷取您新增的任何內容或資訊，請點擊「取消刪除」; 否則會在30天後開始刪除您的帳號";
  const description2 =
    wordLibrary?.[
      "after 30 days,you will not be able to access your account or any content you added to the account in the past"
    ] ??
    "30天後，您將無法您將無法帳號或過去您將無法帳號或過去加到帳號的任何內容";

  const { excute: logout } = useAxiosApiWrapper(apis.member.logout, "None");

  const { excute: requestDeleteAccount, isLoading } = useAxiosApiWrapper(
    apis.member.requestDeleteAccount,
    "Update"
  );

  const handleCloseDialog = () => {
    closeDialog();
  };

  const handleCancelDelete = () => {
    setIsCancel(true);
    if (window.localStorage.getItem("onDeleteAccountRequest") === "1") {
      window.localStorage.setItem("onDeleteAccountRequest", "0");
      window.localStorage.removeItem("onDeleteAccountRequest");
      handleCloseDialog();
      router.replace("/login");
      setIsRequest(false);
    } else if (
      window.localStorage.getItem("isDeleteAccountRequested") === "1"
    ) {
      try {
        requestDeleteAccount({ isDelete: 0 })
          .then((res) => {
            if (res.status === 200) {
              window.localStorage.removeItem("onDeleteAccountRequest");
              window.localStorage.removeItem("isDeleteAccountRequested");
              handleCloseDialog();
              router.replace("/me");
            }
            setIsRequest(false);
          })
          .catch((err: AxiosError) => {
            apis.tools.createLog({
              function: "requestDeleteAccount: error",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: err,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
            setIsRequest(false);
          });
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleCancelDelete",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
        setIsRequest(false);
      }
    }
  };

  const handleDeleteAccount = () => {
    setIsRequest(true);
    try {
      requestDeleteAccount({ isDelete: 1 })
        .then((res) => {
          if (res.status === 200) {
            logout();
            window.localStorage.removeItem("onDeleteAccountRequest");
            window.localStorage.setItem(
              "isDeleteAccountRequested",
              res.data.isDelete
            );
            removeCookie("lid");
            removeCookie("tid");
            removeCookie("m_info");
            dispatch(logoutAction());
            handleCloseDialog();
          }
          setIsRequest(false);
        })
        .catch((err: AxiosError) => {
          apis.tools.createLog({
            function: "requestDeleteAccount: error",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: err,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
          setIsRequest(false);
        });
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleDeleteAccount",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
      setIsRequest(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
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
        {wordLibrary?.["your account is scheduled for deletion"] ??
          "您的帳號已排定刪除"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" marginBottom={3}>
          {description1}
        </Typography>
        <Typography variant="body1" marginBottom={3}>
          {description2}
        </Typography>
      </DialogContent>
      <DialogActions>
        <DialogCloseButton
          onClick={handleCancelDelete}
          color="primary"
          disabled={isLoading && isCancel}
          loading={isLoading && isCancel}
        >
          {wordLibrary?.["cancel deletion"] ?? "取消刪除"}
        </DialogCloseButton>
        <DialogConfirmButton
          onClick={handleDeleteAccount}
          loading={isLoading && isRequest}
          disabled={isLoading && isRequest}
          color="default"
        >
          {wordLibrary?.confirm ?? "確認"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default AccountDeletionRequestDialog;
