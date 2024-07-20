import React, { FC } from "react";
import UserTargetPermissionTable, {
  UserTargetPermissionTableProps,
} from "components/UserTargetPermissionManagement/UserTargetPermissionTable";

const BulletinPermissionMange: FC<UserTargetPermissionTableProps> = (props) => (
  <UserTargetPermissionTable {...props} serviceModuleValue="BULLETIN" />
);

export default BulletinPermissionMange;
