import React, { FC } from "react";
import UserTargetPermissionTable, {
  UserTargetPermissionTableProps,
} from "components/UserTargetPermissionManagement/UserTargetPermissionTable";

const SesTemplatePermissionManage: FC<UserTargetPermissionTableProps> = (
  props
) => <UserTargetPermissionTable {...props} serviceModuleValue="SES_TEMPLATE" />;

export default SesTemplatePermissionManage;
