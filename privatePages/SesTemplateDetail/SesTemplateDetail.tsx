import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { makeStyles } from "@mui/styles";

import useTab from "@eGroupAI/hooks/useTab";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import useUserPermission from "@eGroupAI/hooks/apis/useUserPermission";

import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs from "components/ResponsiveTabs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import useBreadcrumb from "utils/useBreadcrumb";
import useSESTemplateId from "utils/SesTemplate/useSESTemplateId";
import SesTemplateInfo from "./SesTemplateInfo";
import SesTemplatePermissionManage from "./SesTemplatePermissionManage";
import SesTemplateSetting from "./SesTemplateSetting";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: "10px 20px",
    position: "relative",
  },
  tabContainer: {
    borderRadius: 0,
    boxShadow: "none",
    padding: 0,
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
    background: theme.palette.common.white,
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
}));

const SesTemplateDetail = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const { query, push, pathname } = useRouter();
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const classes = useStyles();

  const { data, mutate, isValidating } = useSESTemplateId(
    {
      organizationId,
      organizationSesTemplateId: query.organizationSesTemplateId as string,
    },
    {
      locale,
    }
  );
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "SesTemplate",
    (tabValue as string) || "none",
    true
  );

  useBreadcrumb(data?.organizationSesTemplateTitle || "");

  const { data: permissions } = useUserPermission({
    organizationId,
    serviceModuleValue: "SES_TEMPLATE",
    targetId: query.organizationSesTemplateId as string,
  });

  const getPermissionSubModule = (value, permission) => {
    if (!permissions) return false;
    return !!permissions.filter((p) => p.serviceSubModuleValue === value)[0]
      ?.permissionMap?.[permission];
  };

  const tabData = useMemo(
    () =>
      permissions?.map((perm, index) => ({
        value: perm.serviceSubModuleValue,
        label:
          locale === "zh_TW"
            ? perm?.serviceSubModuleNameZh || ""
            : perm?.serviceSubModuleNameEn || "",
        id: `ses-template-detail-tab-${perm.serviceSubModuleNameEn}`,
        testId: `ses-template-detail-tab-${index}`,
      })),
    [locale, permissions]
  );

  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  useEffect(() => {
    if (tabData && value === "none") {
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || "SES_TEMPLATE_INFO",
        },
      });
    }
  }, [pathname, push, query, handleChange, value, tabData]);

  const translatedTitle = `${
    data?.organizationSesTemplateTitle || ""
  } | SES - ${wordLibrary?.["電子郵件範本"] ?? "電子郵件範本"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;
  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <Container maxWidth={false} className={classes.container}>
          <ResponsiveTabs
            tabData={tabData}
            value={value}
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
          {value === "SES_TEMPLATE_INFO" &&
            getPermissionSubModule("SES_TEMPLATE_INFO", "READ") && (
              <SesTemplateInfo
                organizationSesTemplateId={
                  query.organizationSesTemplateId as string
                }
                readable={getPermissionSubModule("SES_TEMPLATE_INFO", "READ")}
                writable={getPermissionSubModule("SES_TEMPLATE_INFO", "WRITE")}
                deletable={getPermissionSubModule(
                  "SES_TEMPLATE_INFO",
                  "DELETE"
                )}
                sesTemplate={data}
                mutate={mutate}
                isValidating={isValidating}
              />
            )}
          {value === "SES_TEMPLATE_AUTH" &&
            getPermissionSubModule("SES_TEMPLATE_AUTH", "READ") && (
              <SesTemplatePermissionManage
                targetId={query.organizationSesTemplateId as string}
                readable={getPermissionSubModule("SES_TEMPLATE_AUTH", "READ")}
                writable={getPermissionSubModule("SES_TEMPLATE_AUTH", "WRITE")}
                deletable={getPermissionSubModule(
                  "SES_TEMPLATE_AUTH",
                  "DELETE"
                )}
              />
            )}
          {value === "SES_TEMPLATE_SETTING" &&
            getPermissionSubModule("SES_TEMPLATE_SETTING", "READ") && (
              <SesTemplateSetting
                sesTemplate={data}
                organizationId={organizationId}
                readable={getPermissionSubModule(
                  "SES_TEMPLATE_SETTING",
                  "READ"
                )}
                writable={getPermissionSubModule(
                  "SES_TEMPLATE_SETTING",
                  "WRITE"
                )}
                deletable={getPermissionSubModule(
                  "SES_TEMPLATE_SETTING",
                  "DELETE"
                )}
              />
            )}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default SesTemplateDetail;
