import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import useTab from "@eGroupAI/hooks/useTab";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";

import PrivateLayout from "components/PrivateLayout";
import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import ResponsiveTabs from "components/ResponsiveTabs";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";

import { ServiceModuleValue } from "interfaces/utils";

import FinanceTemplatesTable from "./FinanceTemplatesTable";

const FinanceTemplates = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      value: "info",
      label: wordLibrary?.infomation ?? "資訊",
    },
    {
      value: "tagGroup",
      label: wordLibrary?.["tag group management"] ?? "標籤管理",
    },
  ];
  const { query, push, pathname } = useRouter();
  const organizationId = useSelector(getSelectedOrgId);
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "Finance",
    (tabValue as string) || "none",
    true
  );

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

  return (
    <PrivateLayout>
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
          {value === "info" && <FinanceTemplatesTable />}
          {value === "tagGroup" && (
            <TagGroupsDataTable
              organizationId={organizationId}
              serviceModuleValue={ServiceModuleValue.FINANCE_TEMPLATE}
            />
          )}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default FinanceTemplates;
