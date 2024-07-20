import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import useTab from "@eGroupAI/hooks/useTab";
import ResponsiveTabs from "components/ResponsiveTabs";
import PrivateLayout from "components/PrivateLayout";
import { ServiceModuleValue } from "interfaces/utils";
import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import FeedbackDataTable from "./FeedbackDataTable";

const Feedbacks = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const { query, push, pathname } = useRouter();
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "feedback",
    (tabValue as string) || "none",
    true
  );
  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  useEffect(() => {
    if (value === "none") {
      handleChange("feedback");
      push({
        pathname,
        query: {
          ...query,
          tab: "feedback",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);

  const translatedTitle = `${wordLibrary?.["網站管理"] ?? "網站管理"} - ${
    wordLibrary?.["聯絡我們"] ?? "聯絡我們"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;
  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <ResponsiveTabs
          value={value}
          tabData={[
            {
              value: "feedback",
              label: "聯絡我們",
            },
            {
              value: "tagGroup",
              label: "標籤管理",
            },
          ]}
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
        {value === "feedback" && (
          <Container sx={{ mt: 3 }} style={{ padding: 0 }}>
            <FeedbackDataTable />
          </Container>
        )}
        {value === "tagGroup" && (
          <TagGroupsDataTable
            organizationId={organizationId}
            serviceModuleValue={ServiceModuleValue.CMS_FEEDBACK}
          />
        )}
      </Main>
    </PrivateLayout>
  );
};

export default Feedbacks;
