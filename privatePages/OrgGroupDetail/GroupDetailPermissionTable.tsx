import React, { FC } from "react";
import UserTargetPermissionTable from "components/UserTargetPermissionManagement/UserTargetPermissionTable";

export interface GroupDetailPermissionTableProps {
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
  targetId: string;
}

const GroupDetailPermissionTable: FC<GroupDetailPermissionTableProps> = (
  props
) => (
  <UserTargetPermissionTable
    {...props}
    serviceModuleValue="ORGANIZATION_GROUP"
  />
);

export default GroupDetailPermissionTable;
