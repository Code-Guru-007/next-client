import React, { FC, useEffect } from "react";
import ValidComponentWrapper from "./ValidComponentWrapper";
import usePermissionValid from "./usePermissionValid";
import { PermissionValidProps } from "./typings";

const PermissionValid: FC<PermissionValidProps> = function ({
  type,
  children,
  setHasPermissions,
  specifiedTargetPermission = false,
  ...other
}) {
  const hasPermission = usePermissionValid(other);

  useEffect(() => {
    if (hasPermission && setHasPermissions) {
      setHasPermissions((v) => [...v, true]);
    }
  }, [hasPermission, setHasPermissions]);

  return (
    <ValidComponentWrapper
      hasPermission={hasPermission || specifiedTargetPermission}
      type={type}
    >
      {children}
    </ValidComponentWrapper>
  );
};

export default PermissionValid;
