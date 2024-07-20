import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import useTab from "@eGroupAI/hooks/useTab";
import { useRouter } from "next/router";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Main from "@eGroupAI/material-layout/Main";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import Container from "@eGroupAI/material/Container";

import PrivateLayout from "components/PrivateLayout";

import { getWordLibrary } from "redux/wordLibrary/selectors";

import ResponsiveTabs from "components/ResponsiveTabs";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";

import SmsTemplateDataTable from "./SmsTemplateDataTable";
import SmsTemplateTagManagement from "./SmsTemplateTagManagement";
import CreateSmsTemplateDialog, { DIALOG } from "./CreateSmsTemplateDialog";

function SmsTemplate() {
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const { query, push, pathname } = useRouter();

  const tabData = [
    {
      value: "info",
      label: wordLibrary?.information ?? "資訊",
      id: "sms-template-tab-info",
      testId: "sms-template-tab-0",
    },
    {
      value: "tagGroup",
      label: wordLibrary?.["label management"] ?? "標籤管理",
      id: "sms-template-tab-tagGroup",
      testId: "sms-template-tab-1",
    },
  ];

  const [isCreated, setIsCreated] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "SmsTemplate",
    (tabValue as string) || "none",
    true
  );

  const { openDialog, closeDialog } = useReduxDialog(DIALOG);

  const handleSuccessCreateSMS = (createdSMSId) => {
    closeDialog();
    setIsCreated(true);
    if (createdSMSId) {
      push(`/me/sms-template/${createdSMSId}?tab=SMS_TEMPLATE_INFO`);
    }
  };

  const { hasModulePermission: tagGroup } = useModulePermissionValid({
    targetPath: "/me/tag-groups",
    modulePermissions: ["LIST", "READ"],
  });

  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  useEffect(() => {
    if (value === "none") {
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || "info",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);

  const translatedTitle = `SMS - ${wordLibrary?.["簡訊範本"] ?? "簡訊範本"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;

  return (
    <>
      <CreateSmsTemplateDialog
        organizationId={organizationId}
        onSuccessCreate={handleSuccessCreateSMS}
      />
      <PrivateLayout title={translatedTitle}>
        <Main>
          <Container maxWidth={false}>
            <ResponsiveTabs
              value={value}
              tabData={
                tagGroup
                  ? tabData
                  : tabData.filter(({ value }) => value !== "tagGroup")
              }
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
            {value === "info" && (
              <SmsTemplateDataTable
                organizationId={organizationId}
                openCreateSMSDialog={() => {
                  openDialog();
                  setIsCreated(false);
                }}
                isCreated={isCreated}
                tableName="SMSTemplatesDataTable"
              />
            )}
            {value === "tagGroup" && <SmsTemplateTagManagement />}
          </Container>
        </Main>
      </PrivateLayout>
    </>
  );
}

export default SmsTemplate;
