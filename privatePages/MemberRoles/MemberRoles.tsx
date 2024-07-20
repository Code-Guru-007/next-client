import React from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import PrivateLayout from "components/PrivateLayout";
import MemberRolesDataTable from "./MemberRolesDataTable";

const MemberRoles = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const translatedTitle = `${wordLibrary?.["人員管理"] ?? "人員管理"} - ${
    wordLibrary?.["角色管理"] ?? "角色管理"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;
  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <Container maxWidth={false}>
          <MemberRolesDataTable />
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default MemberRoles;
