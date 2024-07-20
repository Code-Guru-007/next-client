import React, { useEffect, useMemo } from "react";

import useTab from "@eGroupAI/hooks/useTab";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { useRouter } from "next/router";
import useBreadcrumb from "utils/useBreadcrumb";
import useOrgGroup from "utils/useOrgGroup";

import CircularProgress from "@eGroupAI/material/CircularProgress";
import Main from "@eGroupAI/material-layout/Main";
import { makeStyles } from "@mui/styles";
import Container from "@eGroupAI/material/Container";
import useUserPermission from "@eGroupAI/hooks/apis/useUserPermission";
import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs from "components/ResponsiveTabs";
import UnModuleAuthorized from "components/PrivateLayout/UnModuleAuthorized";
import clsx from "clsx";
import { useSettingsContext } from "minimal/components/settings";

import GroupDetailInfo from "./GroupDetailInfo";
import GroupDetailSettings from "./GroupDetailSettings";

const useStyles = makeStyles(() => ({
  container: {
    padding: "10px 20px",
    position: "relative",
  },
  editSectionContainer: {
    borderRadius: 0,
  },
  mainLayout: {
    background: "#F5F6FA",
    paddingTop: 0,
  },
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
    alignItems: "center",
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

const OrgGroupDetail = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const { query, push, pathname } = useRouter();
  const classes = useStyles();
  const settings = useSettingsContext();
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { data, isError } = useOrgGroup(
    {
      organizationId,
      organizationGroupId: query.groupId as string,
    },
    {
      locale,
    }
  );
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, setValue } = useTab<string>(
    "OrgGroupDetail",
    (tabValue as string) || "none",
    true
  );

  const { data: permissions, isValidating } = useUserPermission({
    organizationId,
    serviceModuleValue: "ORGANIZATION_GROUP",
    targetId: query.groupId as string,
  });

  useBreadcrumb(data?.organizationGroupName || "");

  useEffect(() => {
    if (query.tab) {
      setValue(query.tab as string);
    }
  }, [query.tab, setValue]);

  const permissionTabs = useMemo(
    () => permissions?.filter((per) => per.permissionMap.READ),
    [permissions]
  );

  useEffect(() => {
    if (permissionTabs && value === "none") {
      const tabName = permissionTabs[0]?.serviceSubModuleValue;
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || tabName,
        },
      });
    }
  }, [pathname, permissionTabs, push, query, setValue, value]);

  const getPermissionSubModule = (value, permission) => {
    if (!permissionTabs) return false;
    return !!permissionTabs.filter((p) => p.serviceSubModuleValue === value)[0]
      ?.permissionMap?.[permission];
  };

  const tabData = useMemo(
    () =>
      permissionTabs?.map((e) => ({
        value: e.serviceSubModuleValue,
        label:
          locale === "zh_TW"
            ? e?.serviceSubModuleNameZh || ""
            : e?.serviceSubModuleNameEn || "",
      })),
    [locale, permissionTabs]
  );

  const translatedTitle = `${data?.organizationGroupName || ""} | ${
    wordLibrary?.["單位管理"] ?? "單位管理"
  } | ${wordLibrary?.["單位群組"] ?? "單位群組"} - ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;
  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <Container maxWidth={false}>
          <div
            className={clsx(
              classes.loader,
              (!data || !permissionTabs || isValidating) && classes.showLoader,
              {
                [classes.lightOpacity]: settings.themeMode === "light",
                [classes.darkOpacity]: settings.themeMode !== "light",
              }
            )}
          >
            <CircularProgress />
          </div>
          <ResponsiveTabs
            value={value}
            tabData={tabData}
            onChange={(value) => {
              push({
                pathname,
                query: {
                  ...query,
                  tab: value,
                },
              });
            }}
          />
          {isError && <UnModuleAuthorized />}
          {value === "ORGANIZATION_GROUP_INFO" &&
            getPermissionSubModule(value, "READ") && (
              <GroupDetailInfo
                orgGroup={data}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
              />
            )}
          {value === "ORGANIZATION_GROUP_SETTINGS" &&
            getPermissionSubModule(value, "READ") && (
              <GroupDetailSettings
                organizationId={organizationId}
                orgGroup={data}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
              />
            )}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default OrgGroupDetail;
