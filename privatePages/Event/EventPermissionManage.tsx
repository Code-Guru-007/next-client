import React, { FC } from "react";
import UserTargetPermissionTable, {
  UserTargetPermissionTableProps,
} from "components/UserTargetPermissionManagement/UserTargetPermissionTable";

const EventPermissionMange: FC<UserTargetPermissionTableProps> = (props) => (
  <UserTargetPermissionTable {...props} serviceModuleValue="EVENT" />
);

export default EventPermissionMange;
