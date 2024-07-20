import React, { FC } from "react";
import UserTargetPermissionTable, {
  UserTargetPermissionTableProps,
} from "components/UserTargetPermissionManagement/UserTargetPermissionTable";

const SmsTemplatePermissionManage: FC<UserTargetPermissionTableProps> = (
  props
) => <UserTargetPermissionTable {...props} serviceModuleValue="SMS_TEMPLATE" />;

export default SmsTemplatePermissionManage;
