import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

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
import useSMSTemplateId from "utils/SmsTemplate/useSMSTemplateId";
import SmsTemplateInfo from "./SmsTemplateInfo";
import SmsTemplatePermissionManage from "./SmsTemplatePermissionManage";
import SmsTemplateSetting from "./SmsTemplateSetting";

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

const SmsTemplateDetail = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const { query, push, pathname } = useRouter();
  const organizationId = useSelector(getSelectedOrgId);
  const classes = useStyles();
  const locale = useSelector(getGlobalLocale);

  const { data, mutate, isValidating } = useSMSTemplateId(
    {
      organizationId,
      organizationSmsTemplateId: query.organizationSmsTemplateId as string,
    },
    {
      locale,
    }
  );
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "SmsTemplate",
    (tabValue as string) || "none",
    true
  );

  useBreadcrumb(data?.organizationSmsTemplateTitle || "");

  const { data: permissions } = useUserPermission({
    organizationId,
    serviceModuleValue: "SMS_TEMPLATE",
    targetId: query.organizationSmsTemplateId as string,
  });

  const tabData = useMemo(
    () =>
      permissions?.map((permission, index) => ({
        value: permission.serviceSubModuleValue,
        label: permission?.serviceSubModuleNameZh,
        id: `sms-template-detail-tab-${permission.serviceSubModuleNameEn}`,
        testId: `sms-template-detail-tab-${index}`,
      })),
    [permissions]
  );

  const getPermissionSubModule = (value, permission) => {
    if (!permissions) return false;
    return !!permissions.filter((p) => p.serviceSubModuleValue === value)[0]
      ?.permissionMap?.[permission];
  };

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
          tab: query.tab || "SMS_TEMPLATE_INFO",
        },
      });
    }
  }, [pathname, push, query, handleChange, value, tabData]);

  const translatedTitle = `${
    data?.organizationSmsTemplateTitle || ""
  } | SMS - ${wordLibrary?.["簡訊範本"] ?? "簡訊範本"} | ${
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
          {value === "SMS_TEMPLATE_INFO" &&
            getPermissionSubModule("SMS_TEMPLATE_INFO", "READ") && (
              <SmsTemplateInfo
                organizationSmsTemplateId={
                  query.organizationSmsTemplateId as string
                }
                readable={getPermissionSubModule("SMS_TEMPLATE_INFO", "READ")}
                writable={getPermissionSubModule("SMS_TEMPLATE_INFO", "WRITE")}
                deletable={getPermissionSubModule(
                  "SMS_TEMPLATE_INFO",
                  "DELETE"
                )}
                smsTemplate={data}
                mutate={mutate}
                isValidating={isValidating}
              />
            )}
          {value === "SMS_TEMPLATE_AUTH" &&
            getPermissionSubModule("SMS_TEMPLATE_AUTH", "READ") && (
              <SmsTemplatePermissionManage
                targetId={query.organizationSmsTemplateId as string}
                readable={getPermissionSubModule("SMS_TEMPLATE_AUTH", "READ")}
                writable={getPermissionSubModule("SMS_TEMPLATE_AUTH", "WRITE")}
                deletable={getPermissionSubModule(
                  "SMS_TEMPLATE_AUTH",
                  "DELETE"
                )}
              />
            )}
          {value === "SMS_TEMPLATE_SETTING" &&
            getPermissionSubModule("SMS_TEMPLATE_SETTING", "READ") && (
              <SmsTemplateSetting
                smsTemplate={data}
                organizationId={organizationId}
                readable={getPermissionSubModule(
                  "SMS_TEMPLATE_SETTING",
                  "READ"
                )}
                writable={getPermissionSubModule(
                  "SMS_TEMPLATE_SETTING",
                  "WRITE"
                )}
                deletable={getPermissionSubModule(
                  "SMS_TEMPLATE_SETTING",
                  "DELETE"
                )}
              />
            )}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default SmsTemplateDetail;
