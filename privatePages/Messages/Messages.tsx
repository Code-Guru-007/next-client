import React from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import PrivateLayout from "components/PrivateLayout";
import MessagesDataTable from "./MessagesDataTable";

const Messages = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);

  const translatedTitle = `${
    wordLibrary?.["message management"] ?? "訊息管理"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;

  return (
    <>
      <PrivateLayout title={translatedTitle}>
        <Main sx={{ minHeight: "100vh" }}>
          <Container maxWidth={false}>
            <MessagesDataTable organizationId={organizationId} />
          </Container>
        </Main>
      </PrivateLayout>
    </>
  );
};

export default Messages;
