import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import useTab from "@eGroupAI/hooks/useTab";
import { useRouter } from "next/router";

import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import PrivateLayout from "components/PrivateLayout";
import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import ResponsiveTabs from "components/ResponsiveTabs";
import DynamicColumn from "components/DynamicColumn";
import DynamicColumnGroup from "components/DynamicColumnGroup";
// import DynamicColumnTemplate from "components/DynamicColumnTemplate";
import OrgModuleShareTemplate from "components/OrgModuleShareTemplate";

import useOrgOwnerValid from "components/PermissionValid/useOrgOwnerValid";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";

import { ColumnTable, ServiceModuleValue } from "interfaces/utils";

import { getWordLibrary } from "redux/wordLibrary/selectors";

import CrmUserDataTable from "./CrmUserDataTable";
import CrmUserShareDataTable from "./CrmUserShareDataTable";
import FinanceTemplatesTable from "./FinanceTemplates/FinanceTemplatesTable";

function CrmUsers() {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      value: "info",
      label: wordLibrary?.information ?? "資訊",
      id: "crm-users-tab-info",
      testId: "crm-users-tab-0",
    },
    {
      value: "share",
      label: wordLibrary?.["share with me."] ?? "與我分享",
      id: "crm-users-tab-share",
      testId: "crm-users-tab-1",
    },
    {
      value: "tagGroup",
      label: wordLibrary?.["label management"] ?? "標籤管理",
      id: "crm-users-tab-tagGroup",
      testId: "crm-users-tab-2",
    },
    {
      value: "dynamicColumn",
      label: wordLibrary?.["dynamic field management"] ?? "動態欄位管理",
      id: "crm-users-tab-dynamicColumn",
      testId: "crm-users-tab-3",
    },
    {
      value: "dynamicColumnGroup",
      label:
        wordLibrary?.["dynamic field group management"] ?? "動態欄位群組管理",
      id: "crm-users-tab-dynamicColumnGroup",
      testId: "crm-users-tab-4",
    },
    // {
    //   value: "dynamicColumnTemplate",
    //   label:
    //     wordLibrary?.["dynamic field template management"] ??
    //     "動態欄位範本管理",
    // },
    {
      value: "shareTemplate",
      label: wordLibrary?.["share template management"] ?? "分享範本管理",
      id: "crm-users-tab-shareTemplate",
      testId: "crm-users-tab-5",
    },
    {
      value: "financeTemplate",
      label: wordLibrary?.["finance template management"] ?? "財務範本管理",
      id: "crm-users-tab-financeTemplate",
      testId: "crm-users-tab-6",
    },
    {
      value: "financeTagManagement",
      label: wordLibrary?.["finance tag management"] ?? "財務標籤管理",
      id: "crm-users-tab-financeTagManagement",
      testId: "crm-users-tab-7",
    },
  ];

  const { query, push, pathname } = useRouter();

  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "CrmUsers",
    tabValue || "none",
    true
  );
  const organizationId = useSelector(getSelectedOrgId);

  const isOrgOwner = useOrgOwnerValid(true);
  const { hasModulePermission: isFinanceTemplate } = useModulePermissionValid({
    modulePermissions: [
      "LIST",
      "READ",
      "CREATE",
      "UPDATE",
      "UPDATE_ALL",
      "DELETE",
      "DELETE_ALL",
    ],
    targetPath: "/me/finance/templates",
  });

  const { hasModulePermission: isDynamicColumnPerms } =
    useModulePermissionValid({
      modulePermissions: ["LIST", "READ", "CREATE", "UPDATE_ALL", "DELETE_ALL"],
      targetPath: "/me/dynamic-columns",
    });

  const { hasModulePermission: tagGroup } = useModulePermissionValid({
    targetPath: "/me/tag-groups",
    modulePermissions: ["LIST", "READ"],
  });
  let filteredTabs;
  filteredTabs =
    isOrgOwner || isFinanceTemplate
      ? tabData
      : tabData.filter(
          (tab) =>
            tab.value !== "financeTemplate" &&
            tab.value !== "financeTagManagement"
        );
  filteredTabs =
    isOrgOwner || isDynamicColumnPerms
      ? tabData
      : tabData.filter(
          (tab) =>
            tab.value !== "dynamicColumn" &&
            tab.value !== "dynamicColumnGroup" &&
            tab.value !== "dynamicColumnTemplate"
        );
  filteredTabs =
    isOrgOwner || tagGroup
      ? filteredTabs
      : filteredTabs.filter(
          ({ value }) =>
            value !== "tagGroup" && value !== "financeTagManagement"
        );

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

  const translatedTitle = `${wordLibrary?.["客戶管理"] ?? "客戶管理"} - ${
    wordLibrary?.["個人列表"] ?? "個人列表"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;

  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <Container>
          <ResponsiveTabs
            tabName="Menu"
            value={value}
            tabData={filteredTabs}
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
          {value === "info" && <CrmUserDataTable />}
          {value === "share" && <CrmUserShareDataTable />}
          {value === "tagGroup" && (
            <TagGroupsDataTable
              organizationId={organizationId}
              serviceModuleValue={ServiceModuleValue.CRM_USER}
            />
          )}
          {value === "dynamicColumn" && (
            <DynamicColumn
              dynamicFieldTypeEnable
              columnTable={ColumnTable.OrganizationUser}
              serviceModuleValue={ServiceModuleValue.CRM_USER}
              columnTableString="ORGANIZATION_USER"
            />
          )}
          {value === "dynamicColumnGroup" && (
            <DynamicColumnGroup
              serviceModuleValue={ServiceModuleValue.CRM_USER}
              columnTable="ORGANIZATION_USER"
              tagStatus
            />
          )}
          {/* {value === "dynamicColumnTemplate" && (
            <DynamicColumnTemplate
              serviceModuleValue={ServiceModuleValue.CRM_USER}
              columnTable="ORGANIZATION_USER"
            />
          )} */}
          {value === "shareTemplate" && (
            <OrgModuleShareTemplate
              serviceModuleValue={ServiceModuleValue.CRM_USER}
              columnTable="ORGANIZATION_USER"
            />
          )}
          {value === "financeTemplate" && (
            <FinanceTemplatesTable
              serviceModuleValue={ServiceModuleValue.CRM_USER}
            />
          )}
          {value === "financeTagManagement" && (
            <TagGroupsDataTable
              organizationId={organizationId}
              serviceModuleValue={ServiceModuleValue.FINANCE_TEMPLATE}
            />
          )}
        </Container>
      </Main>
    </PrivateLayout>
  );
}

export default CrmUsers;
