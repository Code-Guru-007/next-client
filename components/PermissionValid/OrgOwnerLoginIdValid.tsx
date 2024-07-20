import React, { FC } from "react";
import useCheckOrgOwner from "@eGroupAI/hooks/apis/useCheckOrgOwner";
import ValidComponentWrapper from "./ValidComponentWrapper";

export interface OrgOwnerLoginIdValidProps {
  type: "disabled" | "hidden";
}

const OrgOwnerLoginIdValid: FC<OrgOwnerLoginIdValidProps> = function ({
  type,
  children,
}) {
  const { isOrgOwner } = useCheckOrgOwner();

  return (
    <ValidComponentWrapper hasPermission={isOrgOwner} type={type}>
      {children}
    </ValidComponentWrapper>
  );
};

export default OrgOwnerLoginIdValid;
