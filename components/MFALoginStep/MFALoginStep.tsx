import React, { useState } from "react";
// import { useCookies } from "react-cookie";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackRounded";
import { LoadingButton } from "@mui/lab";
import { MFALoginAPIResponse, MFALoginApiPayload } from "interfaces/payloads";
import { useBoolean } from "minimal/hooks/use-boolean";
import Iconify from "minimal/components/iconify";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { AxiosResponse } from "axios";

interface TokenKeyErrorProps {
  mfaTokenKey?: string;
}

export interface MFALoginStepProps {
  mfaValue: string;
  loginRelatedOrgId: string;
  setMFAProcessStep: React.Dispatch<
    React.SetStateAction<"MFA_REQUESTED" | "MFA_CONFIRMED" | undefined>
  >;
  setMFALoginResponse: React.Dispatch<
    React.SetStateAction<AxiosResponse<MFALoginAPIResponse, any> | undefined>
  >;
}
const MFALoginStep = function (props: MFALoginStepProps) {
  const {
    mfaValue,
    loginRelatedOrgId = "",
    setMFAProcessStep,
    setMFALoginResponse,
  } = props;
  // const [, setCookie] = useCookies(["XSRF-TOKEN"]);

  const [payload, setPayload] = useState<MFALoginApiPayload>({
    mfaTokenKey: "",
    organizationId: loginRelatedOrgId,
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState<TokenKeyErrorProps>({});
  const [errorMsg, setErrorMsg] = useState("");
  const { excute: mfaLogin, isLoading } = useAxiosApiWrapper(
    apis.member.mfaLogin,
    "None",
    "Login Success",
    "Please try again, or Sign Up first"
  );
  const { excute: mfaResend, isLoading: isResendLoading } = useAxiosApiWrapper(
    apis.member.mfaResend,
    "None"
  );
  const showCode = useBoolean();
  const handleInputChange = (e) => {
    setErrors({
      ...errors,
      mfaTokenKey: undefined,
    });
    setPayload((prev) => ({
      ...prev,
      mfaTokenKey: e.target.value,
    }));
  };
  const handleMFAReSend = (e) => {
    e.preventDefault();
    mfaResend({ organizationId: loginRelatedOrgId })
      .then(() => {
        setSuccessMsg("請再次檢查您的信箱。");
      })
      .catch((error) => {
        setErrorMsg(typeof error === "string" ? error : error.message);
      });
  };
  const handleMFALogin = (e) => {
    e.preventDefault();
    setErrors({
      mfaTokenKey: payload.mfaTokenKey === "" ? "請輸入密鑰" : undefined,
    });
    if (payload.mfaTokenKey === "") {
      return;
    }
    mfaLogin(payload)
      .then((res) => {
        setSuccessMsg("驗證成功");
        setMFALoginResponse(res);
        setMFAProcessStep("MFA_CONFIRMED");
      })
      .catch((error) => {
        setErrorMsg(typeof error === "string" ? error : error.message);
        setErrors({
          mfaTokenKey: "驗證失敗",
        });
      });
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Box sx={{ width: "100%", display: "flex" }}>
        <Button
          onClick={() => setMFAProcessStep(undefined)}
          startIcon={<ArrowBackIcon />}
        >
          返回
        </Button>
      </Box>
      <Typography variant="h4">{`請輸入 ${mfaValue} 驗證碼`}</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {!!successMsg && <Alert severity="success">{successMsg}</Alert>}
      <>
        <TextField
          name="mfaTokenKey"
          type={showCode.value ? "text" : "password"}
          label="驗證碼"
          value={payload.mfaTokenKey}
          onChange={handleInputChange}
          helperText={errors.mfaTokenKey}
          error={!!errors.mfaTokenKey}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showCode.onToggle} edge="end">
                  <Iconify
                    icon={
                      showCode.value
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
          color="primary"
          size="medium"
          type="submit"
          variant="text"
          sx={{ width: "30%" }}
          onClick={handleMFAReSend}
          loading={isResendLoading}
        >
          重發驗證信
        </LoadingButton>
        <LoadingButton
          fullWidth
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          onClick={handleMFALogin}
          loading={isLoading}
        >
          驗證登入
        </LoadingButton>
      </>
    </Stack>
  );
  return (
    <>
      {renderHead}
      {renderForm}
    </>
  );
};

export default MFALoginStep;
