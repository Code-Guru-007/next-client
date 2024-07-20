/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from "react";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import useHasLogin from "utils/useHasLogin";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import validator from "validator";

import GoogleIcon from "@eGroupAI/material-icons/Google";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
// @mui
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
// hooks
import { useBoolean } from "minimal/hooks/use-boolean";
import Iconify from "minimal/components/iconify";

import LoginLayout from "components/LoginLayout/LoginLayout";
import { NormalSignupApiPayload } from "interfaces/payloads";
import {
  OrganizationInfoByDomain,
  OrganizationSetting,
} from "interfaces/entities";
import { AxiosError } from "axios";
import { Box, CircularProgress } from "@mui/material";

interface AccountErrorProps {
  memberEmail?: string;
  memberName?: string;
  memberPassword?: string;
  confirmMemberPassword?: string;
}

const Signup = function () {
  const router = useRouter();
  const hasLogin = useHasLogin();
  const wordLibrary = useSelector(getWordLibrary);

  const { excute: getGoogleLoginUrl, isLoading: isGoogleLogin } =
    useAxiosApiWrapper(apis.member.getGoogleLoginUrl, "None");
  const { excute: normalSignup, isLoading } = useAxiosApiWrapper(
    apis.member.normalSignup,
    "None",
    "Sign up Success",
    "Error"
  );
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const { excute: getOrganizationByDomainName, isLoading: fetchingDomainInfo } =
    useAxiosApiWrapper(apis.org.getOrganizationByDomainName, "None");
  const { excute: getOrganizationSettings, isLoading: fetchingOrgSettings } =
    useAxiosApiWrapper(apis.org.getOrganizationSettings, "None");

  const [account, setAccount] = useState<NormalSignupApiPayload>({
    memberEmail: "",
    memberName: "",
    memberPassword: "",
    confirmMemberPassword: "",
  });
  const [errors, setErrors] = useState<AccountErrorProps>({});
  const [agreeTerm, setAgreeTerm] = useState(false);

  const [organizationData, setOrganizationData] = useState<
    OrganizationInfoByDomain | undefined
  >();
  const [organizationSettings, setOrganizationSettings] = useState<
    OrganizationSetting[]
  >([]);

  const [organizationDomainName] = useState<string>(
    Buffer.from(new URL(window.location.href).host).toString("base64")
  );
  const [fetched, setFetched] = useState<boolean>(false);
  const [restrictionSettings, setRestrictionSettings] = useState<string[]>([]);

  const getOrgData = useCallback(async () => {
    try {
      const org = await getOrganizationByDomainName({
        organizationDomainName,
      });
      setOrganizationData(org.data);

      if (org.data && org.data?.organizationId !== "") {
        try {
          const orgSettingList = await getOrganizationSettings({
            organizationId: org.data.organizationId,
          });
          setOrganizationSettings(orgSettingList.data);
          const filteredSettings = orgSettingList.data.filter(
            (oSetting) =>
              oSetting.organizationSettingType === "ACCOUNT_RESTRICTION"
          );
          const restrictedValues = filteredSettings.map(
            (oSetting) => oSetting.organizationSettingValue
          );
          setRestrictionSettings(restrictedValues);
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
    if (!agreeTerm) {
      openSnackbar({
        message:
          wordLibrary?.[
            "before registering, you need to agree to the terms of service and privacy policy"
          ] ?? "在註冊之前，您需要同意服務條款與隱私政策。",
        severity: "error",
      });
      return;
    }
    getGoogleLoginUrl()
      .then((response) => {
        window.open(response.data as string, "_self");
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (hasLogin) {
      router.replace("/me");
    }
  }, [hasLogin, router]);

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

  const emailValidator = (str) => {
    if (str === "") {
      return wordLibrary?.["this field is required"] ?? "此為必填欄位。";
    }
    if (!validator.isEmail(str)) {
      return (
        wordLibrary?.["please enter a valid email"] ?? "請輸入有效電子郵件。"
      );
    }
    return undefined;
  };
  const password = useBoolean();
  const confirmPassword = useBoolean();
  const [errorMsg, setErrorMsg] = useState("");

  const handleNormalSignup = (e) => {
    e.preventDefault();
    let memberNameError;
    if (account.memberName === "") {
      memberNameError =
        wordLibrary?.["this field is required"] ?? "此為必填欄位。";
    }

    setErrors({
      memberName: memberNameError,
      memberEmail: emailValidator(account.memberEmail),
      memberPassword: (() => {
        let output;
        const messageKey = "this field is required";
        const defaultMessage = "此為必填欄位。";
        if (account.memberPassword === "") {
          output = wordLibrary?.[messageKey] ?? defaultMessage;
        }
        return output;
      })(),
      confirmMemberPassword: (() => {
        let output;
        const messageKey = "this field is required";
        const defaultMessage = "此為必填欄位。";
        if (account.confirmMemberPassword === "") {
          output = wordLibrary?.[messageKey] ?? defaultMessage;
        }
        if (account.memberPassword !== account.confirmMemberPassword) {
          output =
            wordLibrary?.["password does not match"] ??
            "password does not match";
        }
        return output;
      })(),
    });
    const userEmailDomain = account.memberEmail.split("@")[1] as string;
    const isRestrictedAndDomainNotIncluded =
      restrictionSettings.length !== 0 &&
      !restrictionSettings.some((rSettingValue) =>
        rSettingValue.includes(userEmailDomain)
      );
    if (isRestrictedAndDomainNotIncluded) {
      setErrors({
        memberEmail: "請使用具有核准網域的電子郵件",
      });
      return;
    }

    if (
      account.memberName === "" ||
      account.memberEmail === "" ||
      !validator.isEmail(account.memberEmail) ||
      account.memberPassword === "" ||
      account.confirmMemberPassword === "" ||
      account.memberPassword !== account.confirmMemberPassword
    ) {
      return;
    }

    if (!agreeTerm) {
      const messageKey =
        "before registering, you need to agree to the terms of service and privacy policy";
      const defaultMessage = "在註冊之前，您需要同意服務條款與隱私政策。";

      openSnackbar({
        message: wordLibrary?.[messageKey] ?? defaultMessage,
        severity: "error",
      });
      return;
    }

    normalSignup(account)
      .then(() => {
        router.push("/login");
        openSnackbar({
          message: "註冊成功。驗證郵件已發送，請驗證您的帳戶。",
          severity: "success",
        });
      })
      .catch((error) => {
        setErrorMsg(typeof error === "string" ? error : error.message);
        if (error.response.status === 409) {
          openSnackbar({
            message: "此帳戶已經註冊過了",
            severity: "error",
          });
        }
      });
  };

  const handleChangeAgree = () => {
    setAgreeTerm(!agreeTerm);
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
      <Typography variant="h4">
        {organizationData?.organizationRegisterTitle ?? "立即建立您的帳號"}
      </Typography>

      <Stack direction="row" justifyContent="center" spacing={0.5}>
        <Typography variant="body2"> 已經有帳號? </Typography>

        <Link href="/login" variant="subtitle2">
          登入
        </Link>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <FormControlLabel
      label="我同意《服務條款》、《隱私政策》和《Cookie 政策》"
      control={
        <Checkbox
          size="small"
          checked={agreeTerm}
          onChange={handleChangeAgree}
        />
      }
      sx={{ margin: "10px 0px", letterSpacing: "-1px" }}
    />
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {organizationSettings.length !== 0 &&
      organizationSettings[0]?.organizationSettingType !== "" ? (
        <>
          {(organizationSettings.some(
            (item) => item.organizationSettingValue === "STANDARD"
          ) ||
            restrictionSettings.length > 0) && (
            <>
              <TextField
                name="memberName"
                label={wordLibrary?.["full name"] ?? "姓名"}
                value={account.memberName}
                onChange={handleInputChange}
                helperText={errors.memberName}
                error={!!errors.memberName}
              />
              <TextField
                name="memberEmail"
                label="帳號(email)"
                value={account.memberEmail}
                onChange={handleInputChange}
                helperText={errors.memberEmail}
                error={!!errors.memberEmail}
              />
              <TextField
                name="memberPassword"
                label="密碼"
                type={password.value ? "text" : "password"}
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
              <TextField
                name="confirmMemberPassword"
                label="確認密碼"
                type={confirmPassword.value ? "text" : "password"}
                value={account.confirmMemberPassword}
                onChange={handleInputChange}
                helperText={errors.confirmMemberPassword}
                error={!!errors.confirmMemberPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={confirmPassword.onToggle} edge="end">
                        <Iconify
                          icon={
                            confirmPassword.value
                              ? "solar:eye-bold"
                              : "solar:eye-closed-bold"
                          }
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <LoadingButton
                fullWidth
                color="primary"
                size="large"
                type="submit"
                variant="contained"
                loading={isLoading}
              >
                註冊
              </LoadingButton>
            </>
          )}
          {organizationSettings.some(
            (item) => item.organizationSettingValue === "GOOGLE"
          ) && (
            <LoadingButton
              fullWidth
              variant="outlined"
              color="inherit"
              size="large"
              onClick={handleGoogleLogin}
              startIcon={<GoogleIcon />}
              loading={isGoogleLogin}
              loadingPosition="end"
            >
              Google註冊
            </LoadingButton>
          )}
        </>
      ) : organizationSettings.length === 0 ||
        Object.keys(organizationData || {}).length === 0 ? (
        <>
          <TextField
            name="memberName"
            label={wordLibrary?.["full name"] ?? "姓名"}
            value={account.memberName}
            onChange={handleInputChange}
            helperText={errors.memberName}
            error={!!errors.memberName}
          />
          <TextField
            name="memberEmail"
            label="帳號(email)"
            value={account.memberEmail}
            onChange={handleInputChange}
            helperText={errors.memberEmail}
            error={!!errors.memberEmail}
          />
          <TextField
            name="memberPassword"
            label="密碼"
            type={password.value ? "text" : "password"}
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
          <TextField
            name="confirmMemberPassword"
            label="確認密碼"
            type={confirmPassword.value ? "text" : "password"}
            value={account.confirmMemberPassword}
            onChange={handleInputChange}
            helperText={errors.confirmMemberPassword}
            error={!!errors.confirmMemberPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={confirmPassword.onToggle} edge="end">
                    <Iconify
                      icon={
                        confirmPassword.value
                          ? "solar:eye-bold"
                          : "solar:eye-closed-bold"
                      }
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <LoadingButton
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={isLoading}
          >
            註冊
          </LoadingButton>
          <LoadingButton
            fullWidth
            variant="outlined"
            color="inherit"
            size="large"
            onClick={handleGoogleLogin}
            startIcon={<GoogleIcon />}
            loading={isGoogleLogin}
            loadingPosition="end"
          >
            Google註冊
          </LoadingButton>
        </>
      ) : (
        <></>
      )}
    </Stack>
  );

  if (!hasLogin) {
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
          <LoginLayout
            title={
              organizationData?.organizationRegisterBackgroundText ??
              "使用 InfoCenter 以開始您的事業"
            }
            alignValue={
              organizationData?.organizationLoginRegisterSectionAlignment
            }
          >
            <form autoComplete="off" onSubmit={handleNormalSignup}>
              {renderHead}

              {renderForm}

              {renderTerms}
            </form>
          </LoginLayout>
        )}
      </>
    );
  }

  return <div />;
};

export default Signup;
