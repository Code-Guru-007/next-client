import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import PrivateLayout from "components/PrivateLayout";
import { Main } from "@eGroupAI/material-layout";
import { Box, CircularProgress, Container } from "@eGroupAI/material";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import { Member } from "@eGroupAI/typings/apis";

import apis from "utils/apis";
import { AxiosError } from "axios";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useSettingsContext } from "minimal/components/settings";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { DurationValueType } from "interfaces/form";
import AccountInfo from "./AccountInfo";
import PersonalInfo from "./PersonalInfo";
import BindingMember from "./BindingMemberAccount";
import PasswordUpdateDialog, { DIALOG } from "./MemberPasswordUpdateDialog";

const useStyles = makeStyles(() => ({
  tabContainer: {
    borderRadius: 0,
    boxShadow: "none",
    padding: 0,
    marginBottom: 0,
    "& .MuiTabs-indicator": {
      height: 2,
    },
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
}));

const Setting = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const settings = useSettingsContext();

  const { asPath } = useRouter();
  const { data: memberInfo, isValidating: isLoading, mutate } = useMemberInfo();

  const { closeDialog } = useReduxDialog(DIALOG);
  const { excute: updateMemberInfo } = useAxiosApiWrapper(
    apis.member.updateMemberInfo,
    "Update"
  );
  const { excute: memberBindingWith3rdParty, isLoading: isBinding } =
    useAxiosApiWrapper(apis.member.bindingMemberWith3rdParty, "Update");

  const { excute: getBindingUrl, isLoading: isGettingUrl } = useAxiosApiWrapper(
    apis.member.getBindingUrl,
    "Read"
  );

  const { excute: updateMemberPassword, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.member.updateMemberPassword, "Update");

  const handleUpdateMemberInfo = async (
    name: string,
    value?: DurationValueType
  ) => {
    try {
      const updatedValue = value?.value !== undefined ? value?.value : "";
      await updateMemberInfo({
        memberName: memberInfo?.memberName,
        memberEmail: memberInfo?.memberEmail,
        [name]: updatedValue,
      });
      mutate();
      return "success";
    } catch {
      return "failed";
    }
  };

  const handleBindWith3rdParty = async (thirdParty: string) => {
    if (thirdParty === "google") {
      // getGoogleLoginUrl().then((response) => {
      getBindingUrl({ thirdParty })
        .then((response) => {
          if (response.data) {
            window.localStorage.setItem("loginRedirectURL", asPath);
            window.open(response.data as string, "_self");
          }
        })
        .catch(() => {});
    }
  };

  const handleUnBindWith3rdParty = async (thirdParty: string) => {
    try {
      await memberBindingWith3rdParty({
        type: "unbind",
        thirdParty,
      });
      mutate();
      return "success";
    } catch {
      return "failed";
    }
  };

  const handleUpdatePassword = async (
    memberOldPassword: string,
    memberPassword: string
  ) => {
    try {
      const res = await updateMemberPassword({
        memberOldPassword,
        memberPassword,
      });
      mutate();
      closeDialog();
      return res.status;
    } catch (err) {
      return (err as AxiosError).response?.status as number;
    }
  };

  const translatedTitle = `${wordLibrary?.setting ?? "Setting"}`;
  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <Container maxWidth={false}>
          <Box
            className={clsx(classes.loader, isLoading && classes.showLoader, {
              [classes.lightOpacity]: settings.themeMode === "light",
              [classes.darkOpacity]: settings.themeMode !== "light",
            })}
          >
            <CircularProgress />
          </Box>
          <AccountInfo
            loading={isLoading}
            memberInfo={memberInfo as Member}
            handleChange={handleUpdateMemberInfo}
          />
          <PersonalInfo
            loading={isLoading}
            memberInfo={memberInfo as Member}
            handleChange={handleUpdateMemberInfo}
          />
          <BindingMember
            loading={isLoading}
            isBinding={isBinding || isGettingUrl}
            memberInfo={memberInfo as Member}
            handleBind={handleBindWith3rdParty}
            handleUnBind={handleUnBindWith3rdParty}
          />
          <PasswordUpdateDialog
            loading={isUpdating}
            primary={wordLibrary?.["change password"] ?? "更改密碼"}
            description={
              wordLibrary?.[
                "password strength:at least 8 characters,recommended to use a strong password different from other services"
              ] ??
              "密碼強度：至少要有 8 個字元，建議使用與其他服務不同的高強度密碼"
            }
            onConfirm={handleUpdatePassword}
          />
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default Setting;
