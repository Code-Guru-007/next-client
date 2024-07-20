import React, { FC, useState } from "react";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import useHasLogin from "utils/useHasLogin";
import { useRouter } from "next/router";
import { DIALOG as ALERT_DIALOG } from "components/App";

import Button from "@eGroupAI/material/Button";
import GoogleIcon from "@eGroupAI/material-icons/Google";
import LoginLayout from "components/LoginLayout/LoginLayout";
import { GetServerSideProps } from "next";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { NormalLoginApiPayload } from "interfaces/payloads";
import {
  Alert,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";
import LoadingButton from "@mui/lab/LoadingButton";
import { useBoolean } from "minimal/hooks/use-boolean";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie;

  if (cookies) {
    return {
      props: {
        cookies,
      },
    };
  }

  return {
    props: {},
  };
};

export interface OrgInvitationProps {
  cookies: string;
}
interface AccountErrorProps {
  memberAccount?: string;
  memberPassword?: string;
}

const OrgInvitation: FC<OrgInvitationProps> = function ({ cookies }) {
  const { excute: getGoogleLoginUrl, isLoading: isGoogleLogin } =
    useAxiosApiWrapper(apis.member.getGoogleLoginUrl, "None");
  const hasLogin = useHasLogin(cookies);

  const router = useRouter();
  const { query, asPath, push } = useRouter();

  const { orgId, token } = query;
  const { excute: updateOrgMemberInvitation, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.org.updateOrgMemberInvitation);
  const { openDialog: openAlertDialog } = useReduxDialog(ALERT_DIALOG);

  const { excute: normalLogin, isLoading } = useAxiosApiWrapper(
    apis.member.normalLogin,
    "None",
    "Login Success",
    "Please try again, or Sign Up first"
  );
  const [account, setAccount] = useState<NormalLoginApiPayload>({
    memberAccount: "",
    memberPassword: "",
  });
  const [errors, setErrors] = useState<AccountErrorProps>({});
  const [errorMsg, setErrorMsg] = useState("");
  const password = useBoolean();
  const handleGoogleLogin = () => {
    getGoogleLoginUrl()
      .then((response) => {
        window.localStorage.setItem("loginRedirectURL", asPath);
        window.open(response.data as string, "_self");
      })
      .catch(() => {});
  };

  const handleNormalLogin = (e) => {
    e.preventDefault();
    setErrors({
      memberAccount:
        account.memberAccount === "" ? "請輸入帳號(email)" : undefined,
      memberPassword: account.memberPassword === "" ? "請輸入密碼" : undefined,
    });
    if (account.memberAccount === "" || account.memberPassword === "") {
      return;
    }
    normalLogin(account)
      .then(() => {
        window.localStorage.setItem("loginRedirectURL", asPath);
        router.replace("/login");
      })
      .catch((error) => {
        setErrorMsg(typeof error === "string" ? error : error.message);
        setErrors({
          memberAccount: "帳號或密碼錯誤",
        });
      });
  };

  const handleInputChange = (e) => {
    setErrors({
      ...errors,
      [e.target.name]: undefined,
    });
    setAccount({
      ...account,
      [e.target.name]: e.target.value,
    });
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Sign in to InfoCenter</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">新用戶？</Typography>

        <Link href="/signup" variant="subtitle2">
          創建一個帳戶
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <TextField
        name="memberAccount"
        label="帳號(email)"
        value={account.memberAccount}
        onChange={handleInputChange}
        helperText={errors.memberAccount}
        error={!!errors.memberAccount}
      />

      <TextField
        name="memberPassword"
        type={password.value ? "text" : "password"}
        label="密碼"
        value={account.memberPassword}
        onChange={handleInputChange}
        helperText={errors.memberPassword}
        error={!!errors.memberPassword}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify
                  icon={
                    password.value ? "solar:eye-bold" : "solar:eye-closed-bold"
                  }
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <FormControlLabel
            label="記住我"
            control={<Checkbox size="small" />}
          />
        </Grid>
        <Grid item>
          <Link
            href="/forgot-password"
            variant="body2"
            color="inherit"
            underline="always"
            sx={{ alignSelf: "flex-end" }}
          >
            忘記密碼?
          </Link>
        </Grid>
      </Grid>

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isLoading}
      >
        登入
      </LoadingButton>
      <LoadingButton
        fullWidth
        variant="outlined"
        color="inherit"
        size="large"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        loading={isGoogleLogin}
        loadingPosition="end"
      >
        Google登入
      </LoadingButton>
    </Stack>
  );

  if (hasLogin) {
    return (
      <LoginLayout title="成員邀請">
        <Button
          variant="contained"
          color="info"
          sx={{ mb: 2 }}
          loading={isUpdating}
          onClick={() => {
            updateOrgMemberInvitation({
              organizationId: orgId as string,
              organizationInvitationToken: token as string,
              organizationInvitationStatus: 3,
            })
              .then(() => {
                push("/me");
              })
              .catch((err) => {
                if (err.response.status === 401) {
                  openAlertDialog({
                    variant: "confirm",
                    title: "無權限",
                    message:
                      "您無法使用此邀請連結，請確認邀請Email是否填寫正確。",
                  });
                }
              });
          }}
        >
          接受
        </Button>
        <Button
          variant="contained"
          color="error"
          loading={isUpdating}
          onClick={() => {
            updateOrgMemberInvitation({
              organizationId: orgId as string,
              organizationInvitationToken: token as string,
              organizationInvitationStatus: 2,
            })
              .then(() => {
                push("/me");
              })
              .catch((err) => {
                if (err.response.status === 401) {
                  openAlertDialog({
                    title: "無權限",
                    message:
                      "您無法使用此邀請連結，請確認邀請Email是否填寫正確。",
                  });
                }
              });
          }}
        >
          拒絕
        </Button>
      </LoginLayout>
    );
  }

  return (
    <LoginLayout title="單位成員邀請">
      <form onSubmit={handleNormalLogin}>
        {renderHead}
        {renderForm}
      </form>
    </LoginLayout>
  );
};

export default OrgInvitation;
