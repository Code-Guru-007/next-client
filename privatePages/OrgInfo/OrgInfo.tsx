import React from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import useModulePermissionValid from "components/PermissionValid/useModulePermissionValid";
import useOrgOwnerValid from "components/PermissionValid/useOrgOwnerValid";
import Main from "@eGroupAI/material-layout/Main";
import PrivateLayout from "components/PrivateLayout";
import EditSection from "components/EditSection";
import makeStyles from "@mui/styles/makeStyles";
import OrgInfoEditor from "./OrgInfoEditor";

const useStyles = makeStyles(() => ({
  editSec: {
    paddingTop: "30px",
    margin: "0px 20px 10px 20px",
  },
}));
const OrgInfo = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const { hasModulePermission: editable } = useModulePermissionValid({
    modulePermissions: ["UPDATE_ALL"],
  });
  const isOrgOwner = useOrgOwnerValid(true);
  const translatedTitle = `${wordLibrary?.["單位管理"] ?? "單位管理"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  }`;

  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <EditSection className={classes.editSec}>
          <OrgInfoEditor editable={editable || isOrgOwner} />
        </EditSection>
      </Main>
    </PrivateLayout>
  );
};

export default OrgInfo;
