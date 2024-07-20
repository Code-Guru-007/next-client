import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

import { useRouter } from "next/router";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import apis from "utils/apis";

import FixedCenter from "@eGroupAI/material-layout/FixedCenter";
import { CircularProgress } from "@eGroupAI/material";
import { DIALOG as ALERT_DIALOG } from "components/App";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { AxiosResponse } from "axios";
import { MFALoginAPIResponse } from "interfaces/payloads";
import MFALoginStep from "components/MFALoginStep";

const GoogleLogin = function () {
  const router = useRouter();
  const [, setCookie] = useCookies(["XSRF-TOKEN"]);
  const { openDialog } = useReduxDialog(ALERT_DIALOG);

  const { excute: googleLogin } = useAxiosApiWrapper(
    apis.member.googleLogin,
    "Update"
  );

  const { excute: verifyAccountBy3rdParty } = useAxiosApiWrapper(
    apis.member.verifyAccountBy3rdParty,
    "Update"
  );

  const loginRelatedOrgId =
    window.localStorage.getItem("loginRelatedOrgId") ?? undefined;

  const [mfaProcessStep, setMFAProcessStep] = useState<
    "MFA_REQUESTED" | "MFA_CONFIRMED" | undefined
  >();
  const [mfaValue, setMFAValue] = useState<string>();
  const [mfaLoginResponse, setMFALoginResponse] =
    useState<AxiosResponse<MFALoginAPIResponse, any>>();

  useEffect(() => {
    if (router.query.code) {
      googleLogin({
        code: router.query.code as string,
        organizationId: loginRelatedOrgId,
      })
        .then((res) => {
          let organizationSettingsFiltered;
          if (Array.isArray(res.data)) {
            organizationSettingsFiltered = res.data.filter(
              (item) => item.organizationSettingType === "MFA_METHOD"
            );
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
            const loginRedirectURL =
              window.localStorage.getItem("loginRedirectURL");
            window.localStorage.removeItem("loginRedirectURL");
            if (loginRedirectURL === "/me/settings-privacy/privacy") {
              verifyAccountBy3rdParty({
                thirdPartyName: "google",
                code: router.query.code as string,
              })
                .then((res) => {
                  setCookie("XSRF-TOKEN", res.headers["x-csrf-token"]);
                  window.localStorage.setItem(
                    "verifiedBy3rdPartyLogin",
                    res.data
                  );
                  router.replace(loginRedirectURL ?? "/me");
                })
                .catch((err) => {
                  window.localStorage.setItem("verifiedBy3rdPartyLogin", err);
                  router.replace(loginRedirectURL ?? "/me");
                });
            } else {
              router.replace(loginRedirectURL ?? "/me");
            }
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
          const loginRedirectURL =
            window.localStorage.getItem("loginRedirectURL");
          router.replace(loginRedirectURL ?? "/me");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDialog, router]);

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

  return (
    <FixedCenter>
      {!mfaProcessStep && <CircularProgress />}
      {mfaProcessStep === "MFA_REQUESTED" && (
        <MFALoginStep
          mfaValue={mfaValue ?? ""}
          loginRelatedOrgId={loginRelatedOrgId ?? ""}
          setMFAProcessStep={setMFAProcessStep}
          setMFALoginResponse={setMFALoginResponse}
        />
      )}
    </FixedCenter>
  );
};

export default GoogleLogin;
