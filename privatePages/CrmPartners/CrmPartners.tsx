import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import useTab from "@eGroupAI/hooks/useTab";
import { useRouter } from "next/router";

import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs from "components/ResponsiveTabs";
import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import DynamicColumn from "components/DynamicColumn";
import DynamicColumnGroup from "components/DynamicColumnGroup";
import DynamicColumnTemplate from "components/DynamicColumnTemplate";

import useOrgOwnerValid from "components/PermissionValid/useOrgOwnerValid";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";

import { ColumnTable, ServiceModuleValue } from "interfaces/utils";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import CrmPartnersDataTable from "./CrmPartnersDataTable";

function CrmPartners() {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      value: "info",
      label: wordLibrary?.information ?? "資訊",
    },
    {
      value: "tagGroup",
      label: wordLibrary?.["label management"] ?? "標籤管理",
    },
    {
      value: "dynamicColumn",
      label: wordLibrary?.["dynamic field management"] ?? "動態欄位管理",
    },
    {
      value: "dynamicColumnGroup",
      label:
        wordLibrary?.["dynamic field group management"] ?? "動態欄位群組管理",
    },
    {
      value: "dynamicColumnTemplate",
      label:
        wordLibrary?.["dynamic field template management"] ??
        "動態欄位範本管理",
    },
  ];
  const { query, push, pathname } = useRouter();
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "CrmPartners",
    (tabValue as string) || "none",
    true
  );
  const organizationId = useSelector(getSelectedOrgId);

  const isOrgOwner = useOrgOwnerValid(true);
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
      : filteredTabs.filter(({ value }) => value !== "tagGroup");

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
    wordLibrary?.["單位列表"] ?? "單位列表"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;

  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <Container maxWidth={false}>
          <ResponsiveTabs
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
          {value === "info" && <CrmPartnersDataTable isCreated={false} />}
          {value === "tagGroup" && (
            <TagGroupsDataTable
              organizationId={organizationId}
              serviceModuleValue={ServiceModuleValue.CRM_PARTNER}
            />
          )}
          {value === "dynamicColumn" && (
            <DynamicColumn
              columnTable={ColumnTable.OrganizatonPartner}
              serviceModuleValue={ServiceModuleValue.CRM_PARTNER}
              columnTableString={ColumnTable.OrganizatonPartner}
            />
          )}
          {value === "dynamicColumnGroup" && (
            <DynamicColumnGroup
              serviceModuleValue={ServiceModuleValue.CRM_PARTNER}
              tagStatus
              columnTable={ColumnTable.OrganizatonPartner}
            />
          )}
          {value === "dynamicColumnTemplate" && (
            <DynamicColumnTemplate
              serviceModuleValue={ServiceModuleValue.CRM_PARTNER}
              columnTable={ColumnTable.OrganizatonPartner}
            />
          )}
        </Container>
      </Main>
    </PrivateLayout>
  );
}

export default CrmPartners;
