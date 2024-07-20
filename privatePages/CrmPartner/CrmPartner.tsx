import React, { useEffect, useMemo, useState } from "react";

import useTab from "@eGroupAI/hooks/useTab";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import ResponsiveTabs from "components/ResponsiveTabs";
import { useRouter } from "next/router";
import useBreadcrumb from "utils/useBreadcrumb";
import useOrgPartner from "utils/useOrgPartner";

import CircularProgress from "@eGroupAI/material/CircularProgress";
import Main from "@eGroupAI/material-layout/Main";
import { makeStyles } from "@mui/styles";
import Container from "@eGroupAI/material/Container";
import useUserPermission from "@eGroupAI/hooks/apis/useUserPermission";
import PrivateLayout from "components/PrivateLayout";
import clsx from "clsx";
import { useSettingsContext } from "minimal/components/settings";

// import CrmPartnerInfo from "./CrmPartnerInfo";
import CrmPartnerInfoRewrite from "./CrmPartnerInfoRewrite";
import CrmPartnerFiles from "./CrmPartnerFiles";
import CrmPartnerEvent from "./CrmPartnerEvent";
import CrmPermissions from "./CrmPermissions";
import CrmPartnerSetting from "./CrmPartnerSettings";

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

const CrmPartner = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const { query, push, pathname } = useRouter();
  const classes = useStyles();
  const settings = useSettingsContext();

  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const [isOpenCommentDrawer, setIsOpenCommentDrawer] =
    useState<boolean>(false);
  const { data, isValidating: isLoading } = useOrgPartner(
    {
      organizationId,
      organizationPartnerId: query.partnerId as string,
    },
    {
      locale,
    }
  );

  const { value, setValue } = useTab<string>(
    "CrmPartner",
    (query.tab as string) || "none",
    true
  );

  const { data: permissions, isValidating } = useUserPermission({
    organizationId,
    serviceModuleValue: "CRM_PARTNER",
    targetId: query.partnerId as string,
  });

  useBreadcrumb(
    locale === "zh_TW"
      ? data?.organizationPartnerNameZh || ""
      : data?.organizationPartnerNameEn || ""
  );

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

  const translatedTitle = `${data?.organizationPartnerNameZh || ""} | ${
    wordLibrary?.["客戶管理"] ?? "客戶管理"
  } - ${wordLibrary?.["單位列表"] ?? "單位列表"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  } `;

  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <Container maxWidth={false} className={classes.container}>
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
          {value === "CRM_PARTNER_INFO" &&
            getPermissionSubModule(value, "READ") && (
              <CrmPartnerInfoRewrite
                orgPartner={data}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
                tabValue={value}
                tabData={tabData}
                isOpenDrawer={isOpenCommentDrawer}
                setIsOpenDrawer={(isOpen) => {
                  setIsOpenCommentDrawer(isOpen);
                }}
                // onUpdatePartner={handleUpdatePartner}
                // OnShowHistoryDialog={handleClickHistory}
              />
            )}
          {value === "CRM_PARTNER_FILES" &&
            getPermissionSubModule(value, "READ") && (
              <CrmPartnerFiles
                orgPartnerId={query.partnerId as string}
                readable
                writable={getPermissionSubModule(value, "WRITE")}
                deletable={getPermissionSubModule(value, "DELETE")}
                data={data?.uploadFileList || []}
                loading={isLoading}
              />
            )}
          {value === "CRM_PARTNER_EVENTS" &&
            getPermissionSubModule(value, "READ") && (
              <CrmPartnerEvent partner={data} />
            )}
          {value === "CRM_PARTNER_AUTH" &&
            getPermissionSubModule(value, "READ") && (
              <CrmPermissions
                targetId={query.partnerId as string}
                readable
                deletable={getPermissionSubModule(value, "DELETE")}
                writable={getPermissionSubModule(value, "WRITE")}
              />
            )}
          {value === "CRM_PARTNER_SETTINGS" &&
            getPermissionSubModule(value, "READ") && (
              <CrmPartnerSetting
                organizationId={organizationId}
                partner={data}
                readable
                writable={getPermissionSubModule(value, "READ")}
                deletable={getPermissionSubModule(value, "DELETE")}
              />
            )}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default CrmPartner;
