import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import useTab from "@eGroupAI/hooks/useTab";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs from "components/ResponsiveTabs";

import SmsDataTable from "./SmsDataTable";

const SmsMangement = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      value: "0",
      label: wordLibrary?.["sms list"] ?? "簡訊列表",
      id: "sms-tab-list",
      testId: "sms-tab-0",
    },
  ];
  const router = useRouter();
  const organizationId = useSelector(getSelectedOrgId);

  const { value, setValue } = useTab("CrmUser", "0", true);

  useEffect(() => {
    if (router.query.tab) {
      setValue(router.query.tab as string);
    }
  }, [router.query.tab, setValue]);

  return (
    <PrivateLayout title="SMS - 簡訊管理 | InfoCenter 智能中台">
      <Main sx={{ minHeight: "100vh" }}>
        <Container maxWidth={false}>
          <ResponsiveTabs
            value={value}
            tabData={tabData}
            onChange={(value) => {
              router.push({
                pathname: router.pathname,
                query: {
                  ...router.query,
                  tab: value,
                },
              });
            }}
          />
          {value === "0" && <SmsDataTable organizationId={organizationId} />}
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default SmsMangement;
