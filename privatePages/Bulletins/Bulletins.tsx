import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import useTab from "@eGroupAI/hooks/useTab";

import PrivateLayout from "components/PrivateLayout";
import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import ResponsiveTabs from "components/ResponsiveTabs";
import { ServiceModuleValue } from "interfaces/utils";
import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import BulletinsDataTable from "./BulletinsDataTable";

const Bulletins = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      id: "bulletins-publish-btn",
      testId: "bulletins-publish-btn",
      value: "publish",
      label: wordLibrary?.published ?? "已發布",
    },
    {
      id: "bulletins-draft-btn",
      testId: "bulletins-draft-btn",
      value: "draft",
      label: wordLibrary?.draft ?? "未發布",
    },
    {
      id: "bulletins-tagGroup-btn",
      testId: "bulletins-tagGroup-btn",
      value: "tagGroup",
      label: wordLibrary?.["label management"] ?? "標籤管理",
    },
  ];
  const organizationId = useSelector(getSelectedOrgId);
  const router = useRouter();
  const { query, push, pathname } = useRouter();

  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "Bulletins",
    (tabValue as string) || "none",
    true
  );

  const { hasModulePermission: tagGroup } = useModulePermissionValid({
    targetPath: "/me/tag-groups",
    modulePermissions: ["LIST", "READ"],
  });

  useEffect(() => {
    if (router.query.tab) {
      handleChange(router.query.tab as string);
    }
  }, [router.query.tab, handleChange]);

  useEffect(() => {
    if (value === "none") {
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || "publish",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);

  const translatedTitle = `${wordLibrary?.["佈告欄"] ?? "佈告欄"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;

  return (
    <>
      <PrivateLayout title={translatedTitle}>
        <Main sx={{ minHeight: "100vh" }}>
          <Container maxWidth={false}>
            <ResponsiveTabs
              value={String(value)}
              tabData={
                tagGroup
                  ? tabData
                  : tabData.filter(({ value }) => value !== "2")
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
            {value === "publish" && (
              <BulletinsDataTable
                organizationId={organizationId}
                isRelease={1}
                tableName="ReleasedBulletinsDataTable"
              />
            )}
            {value === "draft" && (
              <BulletinsDataTable
                organizationId={organizationId}
                tableName="NonReleasedBulletinsDataTable"
              />
            )}
            {value === "tagGroup" && (
              <TagGroupsDataTable
                organizationId={organizationId}
                serviceModuleValue={ServiceModuleValue.BULLETIN}
              />
            )}
          </Container>
        </Main>
      </PrivateLayout>
    </>
  );
};

export default Bulletins;
