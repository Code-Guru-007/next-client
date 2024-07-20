import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import PrivateLayout from "components/PrivateLayout";
import { Main } from "@eGroupAI/material-layout";
import { Box, CircularProgress, Container, Tab } from "@eGroupAI/material";
import Tabs from "components/Tabs";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import useTab from "@eGroupAI/hooks/useTab";
import { useRouter } from "next/router";
import { useSettingsContext } from "minimal/components/settings";

import DeleteAccount from "./DeleteAccount";
import InformationCopy from "./MemberInformationCopy";

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

const Privacy = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const privacyTabs = [
    {
      label: wordLibrary?.["platform usage"] ?? "平台使用",
      value: "USE_COOKIE",
    },
    {
      label: wordLibrary?.["your InfoCenter info"] ?? "您的InfoCenter資訊",
      value: "SYSTEM_INFO",
    },
    {
      label: wordLibrary?.["create copy"] ?? "建立副本",
      value: "BACKUP_PERSONAL_INFO",
    },
    {
      label: wordLibrary?.["download copy"] ?? "下載副本",
      value: "DOWNLOAD_PERSONAL_INFO",
    },
    {
      label: wordLibrary?.["delete account"] ?? "刪除帳號",
      value: "DELETE_ACCOUNT",
    },
  ];

  const classes = useStyles();
  const settings = useSettingsContext();

  const { query, pathname, push } = useRouter();
  const { data: memberInfo, isValidating: isLoading } = useMemberInfo();

  const { value: tabValue, setValue } = useTab<string>(
    "Privacy",
    privacyTabs[4]?.value || "UNDEFINED",
    true
  );

  useEffect(() => {
    setValue(privacyTabs[4]?.value || "UNDEFINED");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]);

  useEffect(() => {
    if (query?.tab) setValue(query?.tab as string);
  }, [query?.tab, setValue]);

  return (
    <PrivateLayout title="Privacy">
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
          <Tabs
            className={classes.tabContainer}
            value={tabValue}
            onChange={(_, v) => {
              push({
                pathname,
                query: {
                  ...query,
                  tab: v,
                },
              });
            }}
            sx={{ mb: 2 }}
          >
            {privacyTabs.map((t) => (
              <Tab key={t.value} label={t.label} value={t.value} />
            ))}
          </Tabs>
          {tabValue === "USE_COOKIE" && <>USE_COOKIE</>}
          {tabValue === "SYSTEM_INFO" && <InformationCopy />}
          {tabValue === "BACKUP_PERSONAL_INFO" && <>BACKUP_PERSONAL_INFO</>}
          {tabValue === "DOWNLOAD_PERSONAL_INFO" && <>DOWNLOAD_PERSONAL_INFO</>}
          {tabValue === "DELETE_ACCOUNT" && (
            <DeleteAccount memberInfo={memberInfo} />
          )}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default Privacy;
