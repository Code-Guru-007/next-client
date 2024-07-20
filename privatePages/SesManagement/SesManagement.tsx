import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import useTab from "@eGroupAI/hooks/useTab";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import PrivateLayout from "components/PrivateLayout";
import ResponsiveTabs from "components/ResponsiveTabs";

import SesDataTable from "./SesDataTable";

const SesMangement = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const tabData = [
    {
      value: "0",
      label: wordLibrary?.["email list"] ?? "電子郵件列表",
      id: "ses-tab-list",
      testId: "ses-tab-0",
    },
  ];
  const router = useRouter();
  const organizationId = useSelector(getSelectedOrgId);

  const { value, setValue } = useTab("Ses", "0", true);

  useEffect(() => {
    if (router.query.tab) {
      setValue(router.query.tab as string);
    }
  }, [router.query.tab, setValue]);

  const translatedTitle = `SES - ${wordLibrary?.["SES管理"] ?? "SES管理"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;

  return (
    <>
      <PrivateLayout title={translatedTitle}>
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
            {value === "0" && <SesDataTable organizationId={organizationId} />}
          </Container>
        </Main>
      </PrivateLayout>
    </>
  );
};

export default SesMangement;
