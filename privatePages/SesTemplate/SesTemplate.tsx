import React, { useEffect, useState } from "react";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

import useTab from "@eGroupAI/hooks/useTab";
import { useRouter } from "next/router";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Main from "@eGroupAI/material-layout/Main";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import Container from "@eGroupAI/material/Container";
import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs from "components/ResponsiveTabs";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";

import SesTemplateDataTable from "./SesTemplateDataTable";
import SesTemplateTagManagement from "./SesTemplateTagManagement";
import CreateSesTemplateDialog, { DIALOG } from "./CreateSesTemplateDialog";

function SesTemplate() {
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const { query, push, pathname } = useRouter();

  const tabData = [
    {
      value: "info",
      label: wordLibrary?.information ?? "資訊",
      id: "ses-template-tab-info",
      testId: "ses-template-tab-0",
    },
    {
      value: "tagGroup",
      label: wordLibrary?.["label management"] ?? "標籤管理",
      id: "ses-template-tab-tagGroup",
      testId: "ses-template-tab-1",
    },
  ];

  const [isCreated, setIsCreated] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, setValue } = useTab<string>(
    "SesTemplate",
    (tabValue as string) || "none",
    true
  );

  const { openDialog, closeDialog } = useReduxDialog(DIALOG);

  const handleSuccessCreateSES = (createdSESId) => {
    closeDialog();
    setIsCreated(true);
    if (createdSESId) {
      push(`/me/ses-template/${createdSESId}?tab=SES_TEMPLATE_INFO`);
    }
  };

  const { hasModulePermission: tagGroup } = useModulePermissionValid({
    targetPath: "/me/tag-groups",
    modulePermissions: ["LIST", "READ"],
  });

  useEffect(() => {
    if (query.tab) {
      setValue(query.tab as string);
    }
  }, [setValue, query.tab]);

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
  }, [pathname, push, query, setValue, value]);

  const translatedTitle = `SES - ${
    wordLibrary?.["電子郵件範本"] ?? "電子郵件範本"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"} `;

  return (
    <>
      <CreateSesTemplateDialog
        organizationId={organizationId}
        onSuccessCreate={handleSuccessCreateSES}
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
              <SesTemplateDataTable
                organizationId={organizationId}
                openCreateSESDialog={() => {
                  openDialog();
                  setIsCreated(false);
                }}
                isCreated={isCreated}
                tableName="SESTemplatesDataTable"
              />
            )}
            {value === "tagGroup" && <SesTemplateTagManagement />}
          </Container>
        </Main>
      </PrivateLayout>
    </>
  );
}

export default SesTemplate;
