/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import useHasLogin from "utils/useHasLogin";
import { useRouter } from "next/router";

import GoogleIcon from "@eGroupAI/material-icons/Google";

import LoginLayout from "components/LoginLayout/LoginLayout";

// @mui
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";

import { useBoolean } from "minimal/hooks/use-boolean";
import Iconify from "minimal/components/iconify";

import {
  MFALoginAPIResponse,
  NormalLoginApiPayload,
} from "interfaces/payloads";
import AccountDeletionRequestDialog, {
  DIALOG,
} from "privatePages/Settings/Privacy/AccountDeletionRequestDialog";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import {
  OrganizationInfoByDomain,
  OrganizationSetting,
} from "interfaces/entities";
import { Box } from "@mui/material";
import { AxiosError, AxiosResponse } from "axios";
import MFALoginStep from "components/MFALoginStep";

interface AccountErrorProps {
  memberAccount?: string;
  memberPassword?: string;
}

const Login = function () {
  const [, setCookie] = useCookies(["XSRF-TOKEN"]);
  const [account, setAccount] = useState<NormalLoginApiPayload>({
    memberAccount: "",
    memberPassword: "",
  });
  const [errors, setErrors] = useState<AccountErrorProps>({});

  const { openDialog } = useReduxDialog(DIALOG);

  const onDeleteAccountRequest = window.localStorage.getItem(
    "onDeleteAccountRequest"
  );
  const savedDeleteRequested = window.localStorage.getItem(
    "isDeleteAccountRequested"
  );
  const [isDeleteAccountRequested, setIsDeleteAccountRequested] =
    useState<boolean>(Boolean(savedDeleteRequested));

  useEffect(() => {
    setIsDeleteAccountRequested(Boolean(savedDeleteRequested));
  }, [savedDeleteRequested]);

  const { excute: getGoogleLoginUrl, isLoading: isGoogleLogin } =
    useAxiosApiWrapper(apis.member.getGoogleLoginUrl, "None");

  const { excute: normalLogin, isLoading } = useAxiosApiWrapper(
    apis.member.normalLogin,
    "None",
    "Login Success",
    "Please try again, or Sign Up first"
  );

  const { excute: getOrganizationByDomainName, isLoading: fetchingDomainInfo } =
    useAxiosApiWrapper(apis.org.getOrganizationByDomainName, "None");
  const { excute: getOrganizationSettings, isLoading: fetchingOrgSettings } =
    useAxiosApiWrapper(apis.org.getOrganizationSettings, "None");

  const router = useRouter();
  const hasLogin = useHasLogin();
  const selectedOrgId = window.localStorage.getItem("selectedOrgId");

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [organizationDomainName] = useState<string>(
    Buffer.from(new URL(window.location.href).host).toString("base64")
  );
  const [organizationData, setOrganizationData] = useState<
    OrganizationInfoByDomain | undefined
  >();
  const [organizationSettings, setOrganizationSettings] = useState<
    OrganizationSetting[]
  >([]);
  const [fetched, setFetched] = useState<boolean>(false);
  const [restrictionSettings, setRestrictionSettings] = useState<string[]>([]);

  const [loginRelatedOrgId, setLoginRelatedOrgId] = useState<
    string | undefined
  >();
  const [mfaProcessStep, setMFAProcessStep] = useState<
    "MFA_REQUESTED" | "MFA_CONFIRMED" | undefined
  >();
  const [mfaValue, setMFAValue] = useState<string>();
  const [mfaLoginResponse, setMFALoginResponse] =
    useState<AxiosResponse<MFALoginAPIResponse, any>>();

  const getOrgData = useCallback(async () => {
    try {
      const org = await getOrganizationByDomainName({
        organizationDomainName,
      });
      setOrganizationData(org.data);
      setLoginRelatedOrgId(org.data?.organizationId);
      window.localStorage.setItem(
        "loginRelatedOrgId",
        org.data?.organizationId || ""
      );
      if (org.data?.organizationId)
        setAccount((acc) => ({
          ...acc,
          organizationId: org.data?.organizationId,
        }));

      if (org.data && org.data?.organizationId !== "") {
        try {
          const orgSettingList = await getOrganizationSettings({
            organizationId: org.data.organizationId,
          });
          const filteredSettings = orgSettingList.data.filter(
            (oSetting) =>
              oSetting.organizationSettingType === "ACCOUNT_RESTRICTION"
          );
          const restrictedValues = filteredSettings.map(
            (oSetting) => oSetting.organizationSettingValue
          );
          setRestrictionSettings(restrictedValues);
          setOrganizationSettings(orgSettingList.data);
          setErrorMsg("");
          setFetched(true);
        } catch (error: unknown) {
          // eslint-disable-next-line no-console
          console.error("Get organization setting list failed", error);
          setErrorMsg(
            `Get organization setting list failed\n(${
              typeof error === "string" ? error : (error as AxiosError)?.message
            })`
          );
          setFetched(true);
        }
      } else {
        setFetched(true);
        setErrorMsg("");
      }
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error("Get organization info failed", error);
      setErrorMsg(
        `Get organization info failed\n(${
          typeof error === "string" ? error : (error as AxiosError)?.message
        })`
      );
      setFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationDomainName]);

  useEffect(() => {
    if (!fetched) getOrgData();
  }, [fetched, getOrgData]);

  const handleGoogleLogin = () => {
    const rememberMeCheckbox = document.getElementById(
      "rememberMeBox"
    ) as HTMLInputElement;
    const rememberMe = rememberMeCheckbox.checked;

    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("lastActivityTime", Date.now().toString());
    } else {
      localStorage.removeItem("rememberMe");
    }

    getGoogleLoginUrl()
      .then((response) => {
        window.open(response.data as string, "_self");
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (hasLogin && !onDeleteAccountRequest && !isDeleteAccountRequested) {
      const loginRedirectURL = window.localStorage.getItem("loginRedirectURL");
      window.localStorage.removeItem("loginRedirectURL");

      if (loginRedirectURL) router.replace(loginRedirectURL);
      else if (selectedOrgId) {
        router.replace("/me/org-info");
      } else router.replace("/me");
    }
  }, [
    hasLogin,
    isDeleteAccountRequested,
    onDeleteAccountRequest,
    router,
    selectedOrgId,
  ]);

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

  const handleNormalLogin = (e) => {
    e.preventDefault();
    setErrors({
      memberAccount:
        account.memberAccount === "" ? "請輸入帳號(email)" : undefined,
      memberPassword: account.memberPassword === "" ? "請輸入密碼" : undefined,
    });
    const userEmailDomain = account.memberAccount.split("@")[1] as string;
    // Determine if there are restrictions and the user's email domain is not included in the allowed list.
    const isRestrictedAndDomainNotIncluded =
      restrictionSettings.length !== 0 &&
      !restrictionSettings.some((rSettingValue) =>
        rSettingValue.includes(userEmailDomain)
      );
    if (isRestrictedAndDomainNotIncluded) {
      // If there are restrictions and the domain is not allowed, set an error message and return early.
      setErrors({
        memberAccount: "請使用具有核准網域的電子郵件",
      });
      return;
    }
    if (account.memberAccount === "" || account.memberPassword === "") {
      return; // If essential information is missing, no further action is needed.
    }
    normalLogin(account)
      .then((res) => {
        let organizationSettingsFiltered;
        if (Array.isArray(res.data)) {
          organizationSettingsFiltered = res.data.filter(
            (item) => item.organizationSettingType === "MFA_METHOD"
          );
        }
        const rememberMeCheckbox = document.getElementById(
          "rememberMeBox"
        ) as HTMLInputElement;
        const rememberMe = rememberMeCheckbox.checked;

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("lastActivityTime", Date.now().toString());
        } else {
          localStorage.removeItem("rememberMe");
        }
        if (
          organizationSettingsFiltered?.some(
            (oSetting) => oSetting.organizationSettingType === "MFA_METHOD"
          )
        ) {
          setMFAProcessStep("MFA_REQUESTED");
          setMFAValue(
            organizationSettingsFiltered?.[0]?.organizationSettingValue
          );
        } else {
          setCookie("XSRF-TOKEN", res.headers["x-csrf-token"]);
          if (res.data?.isDelete === 1) {
            window.localStorage.setItem(
              "isDeleteAccountRequested",
              res.data?.isDelete.toString()
            );
            openDialog();
          } else {
            router.replace("/me");
          }
        }
      })
      .catch((error) => {
        setErrorMsg(typeof error === "string" ? error : error.message);
        setErrors({
          memberAccount: "帳號或密碼錯誤",
          memberPassword: "帳號或密碼錯誤",
        });
      });
  };

  useEffect(() => {
    if (mfaProcessStep === "MFA_CONFIRMED" && mfaLoginResponse) {
      setCookie("XSRF-TOKEN", mfaLoginResponse.headers["x-csrf-token"]);
      if (mfaLoginResponse.data?.isDelete === 1) {
        window.localStorage.setItem(
          "isDeleteAccountRequested",
          mfaLoginResponse.data?.isDelete.toString()
        );
        openDialog();
      } else {
        router.replace("/me");
      }
    }
  }, [mfaProcessStep, mfaLoginResponse, setCookie, openDialog, router]);

  useEffect(() => {
    if (onDeleteAccountRequest || isDeleteAccountRequested) {
      openDialog();
    }
  }, [isDeleteAccountRequested, onDeleteAccountRequest, openDialog]);

  const password = useBoolean();

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">
        {organizationData?.organizationLoginTitle ?? "立即登入 InfoCenter"}
      </Typography>

      <Stack direction="row" justifyContent="center" spacing={0.5}>
        <Typography variant="body2">新用戶？</Typography>

        <Link href="/signup" variant="subtitle2">
          建立一個帳戶
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {organizationSettings.length > 0 &&
      organizationSettings[0]?.organizationSettingType !== "" ? (
        <>
          {(organizationSettings.some(
            (item) => item.organizationSettingValue === "STANDARD"
          ) ||
            restrictionSettings.length > 0) && (
            <>
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
                            password.value
                              ? "solar:eye-bold"
                              : "solar:eye-closed-bold"
                          }
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}

          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <FormControlLabel
                label="記住我"
                control={<Checkbox size="small" id="rememberMeBox" />}
              />
            </Grid>
            {(organizationSettings.some(
              (item) => item.organizationSettingValue === "STANDARD"
            ) ||
              restrictionSettings.length > 0) && (
              <>
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
              </>
            )}
          </Grid>
          {(organizationSettings.some(
            (item) => item.organizationSettingValue === "STANDARD"
          ) ||
            restrictionSettings.length > 0) && (
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
          )}
          {organizationSettings.some(
            (item) => item.organizationSettingValue === "GOOGLE"
          ) && (
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
          )}
        </>
      ) : organizationSettings.length === 0 ||
        Object.keys(organizationData || {}).length === 0 ? (
        <>
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
                        password.value
                          ? "solar:eye-bold"
                          : "solar:eye-closed-bold"
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
                control={<Checkbox size="small" id="rememberMeBox" />}
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
        </>
      ) : (
        <></>
      )}
    </Stack>
  );

  if (!hasLogin || onDeleteAccountRequest || isDeleteAccountRequested) {
    return (
      <>
        {!fetched || fetchingDomainInfo || fetchingOrgSettings ? (
          <Box
            sx={{
              position: "relative",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress
              sx={{
                position: "absolute",
              }}
            />
          </Box>
        ) : (
          <>
            <LoginLayout
              title={
                organizationData?.organizationLoginBackgroundText ??
                "Hi，歡迎來到 InfoCenter，極速掌握關鍵資訊，高效協助管理"
              }
              alignValue={
                organizationData?.organizationLoginRegisterSectionAlignment
              }
            >
              <form onSubmit={handleNormalLogin}>
                {!mfaProcessStep && renderHead}
                {!mfaProcessStep && renderForm}
                {mfaProcessStep === "MFA_REQUESTED" && (
                  <MFALoginStep
                    mfaValue={mfaValue || ""}
                    loginRelatedOrgId={loginRelatedOrgId || ""}
                    setMFAProcessStep={setMFAProcessStep}
                    setMFALoginResponse={setMFALoginResponse}
                  />
                )}
              </form>
            </LoginLayout>
            {(onDeleteAccountRequest || isDeleteAccountRequested) && (
              <AccountDeletionRequestDialog />
            )}
          </>
        )}
      </>
    );
  }

  return <div />;
};

export default Login;
