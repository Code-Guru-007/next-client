import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import useTab from "@eGroupAI/hooks/useTab";
import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs from "components/ResponsiveTabs";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import MembersDataTable from "./MembersDataTable";
import InvitationsDataTable from "./InvitationsDataTable";
import SalaryTemplateTable from "./SalaryTemplateTable";

const Members = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      id: "member-list-btn",
      testId: "member-list-btn",
      value: "memberList",
      label: wordLibrary?.["member list"] ?? "成員列表",
    },
    {
      id: "invite-list-btn",
      testId: "invite-list-btn",
      value: "invitationList",
      label: wordLibrary?.["invitation list"] ?? "邀請列表",
    },
    {
      id: "salary-template-btn",
      testId: "salary-template-btn",
      value: "salaryTemplate",
      label: wordLibrary?.["salary template"] ?? "薪資範本",
    },
  ];
  const { query, push, pathname } = useRouter();
  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");
  const { value, handleChange } = useTab<string>(
    "Members",
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
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || "memberList",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);

  const translatedTitle = `${wordLibrary?.["人員管理"] ?? "人員管理"} - ${
    wordLibrary?.["成員管理"] ?? "成員管理"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;
  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <Container maxWidth={false}>
          <ResponsiveTabs
            value={value}
            tabData={tabData}
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
          {value === "memberList" && <MembersDataTable /> }
          {value === "invitationList" && <InvitationsDataTable />}
          {value === "salaryTemplate" && <SalaryTemplateTable />}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default Members;
