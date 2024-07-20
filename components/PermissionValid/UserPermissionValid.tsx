import React, { FC } from "react";
import ValidComponentWrapper from "./ValidComponentWrapper";
import useUserPermissionValid from "./useUserPermissionValid";
import { UserPermissionValidProps } from "./typings";

const UserPermissionValid: FC<UserPermissionValidProps> = function ({
  type,
  children,
  ...other
}) {
  const hasPermission = useUserPermissionValid({
    ...other,
  });

  return (
    <ValidComponentWrapper hasPermission={hasPermission} type={type}>
      {children}
    </ValidComponentWrapper>
  );
};

export default UserPermissionValid;
