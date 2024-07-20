import React, { FC } from "react";
import UserTargetPermissionTable, {
  UserTargetPermissionTableProps,
} from "components/UserTargetPermissionManagement/UserTargetPermissionTable";

const UserDetailPermissionTable: FC<UserTargetPermissionTableProps> = (
  props
) => <UserTargetPermissionTable {...props} serviceModuleValue="CRM_USER" />;

export default UserDetailPermissionTable;
