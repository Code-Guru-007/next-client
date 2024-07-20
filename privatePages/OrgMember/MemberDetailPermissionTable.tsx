import React, { FC } from "react";
import MemberTargetPermissionTable from "components/MemberTargetPermissionManagement/MemberTargetPermissionTable";

export interface MemberDetailPermissionTableProps {
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  targetId: string;
}

const MemberDetailPermissionTable: FC<MemberDetailPermissionTableProps> = (
  props
) => (
  <MemberTargetPermissionTable {...props} serviceModuleValue="HRM_MEMBERS" />
);

export default MemberDetailPermissionTable;
