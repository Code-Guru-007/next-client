import React, { useEffect } from "react";
import { useRouter } from "next/router";

import Center from "@eGroupAI/material-layout/Center";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

const Verify = function Verify() {
  const router = useRouter();
  const { emailTokenId } = router.query;

  const { excute: verifyAccount } = useAxiosApiWrapper(
    apis.member.verifyAccount,
    "None",
    "Verification succeded.",
    "Verification faild, please signup once."
  );
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  useEffect(() => {
    if (emailTokenId) {
      verifyAccount({
        emailTokenId: emailTokenId as string,
      })
        .then(() => {
          openSnackbar({
            message: "驗證成功!",
            severity: "success",
          });
          router.replace("/me");
        })
        .catch(() => {
          openSnackbar({
            message: "驗證失敗，請再嘗試一次，謝謝",
            severity: "error",
          });
          router.replace("/signup");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailTokenId]);

  return (
    <Center offsetTop={117}>
      <CircularProgress />
    </Center>
  );
};

export default Verify;
