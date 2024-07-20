import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import useTab from "@eGroupAI/hooks/useTab";
import { useRouter } from "next/router";

import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs from "components/ResponsiveTabs";
import DynamicColumn from "components/DynamicColumn";
import DynamicColumnGroup from "components/DynamicColumnGroup";
import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import { ColumnTable, ServiceModuleValue } from "interfaces/utils";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import useOrgOwnerValid from "components/PermissionValid/useOrgOwnerValid";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";

import OrgGroupDataTable from "./OrgGroupDataTable";

function OrgGroup() {
  const wordLibrary = useSelector(getWordLibrary);
  const { query, push, pathname } = useRouter();
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "OrgGroup",
    (tabValue as string) || "none",
    true
  );
  const organizationId = useSelector(getSelectedOrgId);

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
  ];

  const { hasModulePermission: tagGroup } = useModulePermissionValid({
    targetPath: "/me/tag-groups",
    modulePermissions: ["LIST", "READ"],
  });

  const isOrgOwner = useOrgOwnerValid(true);
  const { hasModulePermission: isDynamicColumnPerms } =
    useModulePermissionValid({
      modulePermissions: ["LIST", "READ", "CREATE", "UPDATE_ALL", "DELETE_ALL"],
      targetPath: "/me/dynamic-columns",
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

  const translatedTitle = `${wordLibrary?.["單位管理"] ?? "單位管理"} - ${
    wordLibrary?.["單位群組"] ?? "單位群組"
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
          {value === "info" && <OrgGroupDataTable />}
          {value === "tagGroup" && (
            <TagGroupsDataTable
              organizationId={organizationId}
              serviceModuleValue={ServiceModuleValue.ORGANIZATION_GROUP}
            />
          )}
          {value === "dynamicColumn" && (
            <DynamicColumn
              columnTable={ColumnTable.OrganizationGroup}
              serviceModuleValue={ServiceModuleValue.ORGANIZATION_GROUP}
              columnTableString="ORGANIZATION_GROUP"
            />
          )}
          {value === "dynamicColumnGroup" && (
            <DynamicColumnGroup
              serviceModuleValue={ServiceModuleValue.ORGANIZATION_GROUP}
              columnTable="ORGANIZATION_GROUP"
              tagStatus={false}
            />
          )}
        </Container>
      </Main>
    </PrivateLayout>
  );
}

export default OrgGroup;
