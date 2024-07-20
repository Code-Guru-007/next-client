import React from "react";
import { useSelector } from "react-redux";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import TagGroupsDataTable from "components/TagGroups/TagGroupsDataTable";
import { ServiceModuleValue } from "interfaces/utils";

const SesTemplateTagManagement = () => {
  const orgId = useSelector(getSelectedOrgId);

  return (
    <TagGroupsDataTable
      organizationId={orgId}
      serviceModuleValue={ServiceModuleValue.SES_TEMPLATE}
    />
  );
};

export default SesTemplateTagManagement;
