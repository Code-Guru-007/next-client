import React, { useEffect } from "react";

import { useRouter } from "next/router";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

import FixedCenter from "@eGroupAI/material-layout/FixedCenter";
import { CircularProgress } from "@eGroupAI/material";
import { DIALOG as ALERT_DIALOG } from "components/App";

const BindingGoogleCallback = () => {
  const router = useRouter();
  const { openDialog } = useReduxDialog(ALERT_DIALOG);

  const { excute: bindingMemberWith3rdParty } = useAxiosApiWrapper(
    apis.member.bindingMemberWith3rdParty,
    "Update"
  );

  useEffect(() => {
    if (router.query.code) {
      bindingMemberWith3rdParty({
        type: "bind",
        thirdParty: "google",
        code: router.query.code as string,
      })
        .then(() => {
          const loginRedirectURL =
            window.localStorage.getItem("loginRedirectURL");
          router.replace(loginRedirectURL || "/me");
          if (loginRedirectURL) {
            window.localStorage.removeItem("loginRedirectURL");
          }
        })
        .catch(() => {
          openDialog({
            title: "Google 帳號驗證失敗",
            message: "Google 帳號驗證失敗請再試一次",
            onConfirm: () => {
              router.replace("/login");
            },
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <FixedCenter>
      <CircularProgress />
    </FixedCenter>
  );
};

export default BindingGoogleCallback;
