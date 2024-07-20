import React, { FC, useState } from "react";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import validator from "validator";
import { useSelector } from "react-redux";

import { useRouter } from "next/router";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";

// @mui
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PasswordIcon } from "minimal/assets/icons";

import Iconify from "minimal/components/iconify";
import CompactLayout from "minimal/layouts/compact";
import apis from "utils/apis";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const Forgot: FC = function Forgot() {
  const wordLibrary = useSelector(getWordLibrary);
  const [memberEmail, setMemberEmail] = useState<string>("");
  const [error, setError] = useState<string | undefined>();
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const router = useRouter();

  const { excute: forgotPassword, isLoading } = useAxiosApiWrapper(
    apis.member.forgotPassword,
    "None"
  );

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendEmail();
    }
  };

  const handleInputChange = (e) => {
    setMemberEmail(e.target.value);
  };

  const getEmailValidateMessage = (str) => {
    if (str === "") {
      return wordLibrary?.["this field is required"] ?? "此為必填欄位。";
    }
    if (!validator.isEmail(str)) {
      return (
        wordLibrary?.["please enter a valid email"] ?? "請輸入有效電子郵件"
      );
    }
    return undefined;
  };

  const handleSendEmail = () => {
    setError(getEmailValidateMessage(memberEmail));
    if (memberEmail === "" || !validator.isEmail(memberEmail)) {
      return;
    }
    forgotPassword({
      memberEmail,
    })
      .then(() => {
        router.push("/login");
        openSnackbar({
          message: "密碼重置郵件已經發送。",
          severity: "success",
        });
      })
      .catch((error) => {
        const message =
          error?.response?.status === 404
            ? "找不到資料，請輸入已註冊之帳號，謝謝。"
            : "密碼重置郵件發送失敗，請重新嘗試。";
        openSnackbar({
          message,
          severity: "error",
        });
      });
  };

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <TextField
        name="memberEmail"
        label="帳號(email)"
        fullWidth
        value={memberEmail}
        onChange={handleInputChange}
        helperText={error}
        error={!!error}
        onKeyPress={handleKeyPress}
      />

      <LoadingButton
        fullWidth
        size="large"
        color="primary"
        variant="contained"
        loading={isLoading}
        onClick={handleSendEmail}
      >
        {wordLibrary?.submit ?? "送出"}
      </LoadingButton>

      <Link
        href="/login"
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: "center",
          display: "inline-flex",
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        返回登入
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">忘記密碼?</Typography>

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          請輸入您帳戶所用的電子郵件，我們將透過電子郵件向您發送重設密碼的連結。
        </Typography>
      </Stack>
    </>
  );

  return (
    <CompactLayout>
      <form>
        {renderHead}

        {renderForm}
      </form>
    </CompactLayout>
  );
};

export default Forgot;
