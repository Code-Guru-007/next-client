import React from "react";
import { useSelector } from "react-redux";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import { ServiceModuleValue } from "interfaces/utils";

const SMSTagManagement = () => {
  const orgId = useSelector(getSelectedOrgId);

  return (
    <TagGroupsDataTable
      organizationId={orgId}
      serviceModuleValue={ServiceModuleValue.SMS_TEMPLATE}
    />
  );
};

export default SMSTagManagement;
