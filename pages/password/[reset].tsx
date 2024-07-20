import React, { FC, useState } from "react";
import { useRouter } from "next/router";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import validator from "validator";

import { useTheme } from "@mui/styles";
import Grid from "@mui/material/Grid";
import { useMediaQuery } from "@mui/material";

import TextField from "@eGroupAI/material/TextField";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";

import LoginLayout from "components/LoginLayout/LoginLayout";
import SigninButton from "components/ButtonForAuth/SigninButton";
import apis from "utils/apis";

interface AccountErrorProps {
  memberPasswordConfirm?: string;
  memberPassword?: string;
}

interface AccountProps {
  memberPassword: string;
  memberPasswordConfirm: string;
}

const Reset: FC = function Reset() {
  const [account, setAccount] = useState<AccountProps>({
    memberPassword: "",
    memberPasswordConfirm: "",
  });
  const [errors, setErrors] = useState<AccountErrorProps>({});
  const router = useRouter();
  const { emailTokenId } = router.query;
  const theme = useTheme();
  const isDownMd = useMediaQuery(theme.breakpoints.down("md"));
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const { excute: resetPassword } = useAxiosApiWrapper(
    apis.member.resetPassword,
    "None"
  );

  const handleInputChange = (e) => {
    setAccount({
      ...account,
      [e.target.name]: e.target.value,
    });
  };

  const handleReset = () => {
    setErrors({
      memberPasswordConfirm:
        account.memberPassword !== account.memberPasswordConfirm
          ? "Password must be match"
          : undefined,
    });
    if (
      !validator.equals(account.memberPassword, account.memberPasswordConfirm)
    ) {
      return;
    }
    resetPassword({
      emailTokenId: emailTokenId as string,
      memberPassword: account.memberPassword,
    })
      .then(() => {
        openSnackbar({
          message: "重設密碼成功",
          severity: "success",
        });
        router.replace("/login");
      })
      .catch(() => {
        openSnackbar({
          message: "重設密碼失敗，請再嘗試一次",
          severity: "error",
        });
      });
  };

  return (
    <LoginLayout title="請重設您的密碼">
      <Grid container spacing={isDownMd ? 3 : 5}>
        <Grid item xs={12}>
          <TextField
            type="password"
            name="memberPassword"
            placeholder="請輸入新密碼"
            fullWidth
            value={account.memberPassword}
            onChange={handleInputChange}
            size={isDownMd ? "small" : "large"}
            helperTextWhite
            helperText={errors.memberPassword}
            error={!!errors.memberPassword}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            type="password"
            name="memberPasswordConfirm"
            placeholder="再次輸入新密碼"
            fullWidth
            value={account.memberPasswordConfirm}
            onChange={handleInputChange}
            size={isDownMd ? "small" : "large"}
            helperTextWhite
            helperText={errors.memberPasswordConfirm}
            error={!!errors.memberPasswordConfirm}
          />
        </Grid>
        <Grid item xs={12}>
          <SigninButton
            fullWidth
            onClick={handleReset}
            color="primary"
            size={isDownMd ? "small" : "medium"}
          >
            重設密碼
          </SigninButton>
        </Grid>
      </Grid>
    </LoginLayout>
  );
};

export default Reset;
