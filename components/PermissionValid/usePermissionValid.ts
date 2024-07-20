import { useMemo } from "react";
import useModulePermissionValid from "./useModulePermissionValid";
import useMemberValid from "./useMemberValid";
import useOrgOwnerValid from "./useOrgOwnerValid";
import getHasPermission from "./getHasPermission";
import { PermissionValidProps } from "./typings";

export default function usePermissionValid({
  modulePermissions,
  modulePermissionsValidWay,
  memberAuth,
  vaildLoginId,
  shouldBeOrgOwner,
  conditions = ["MODULE", "OR", "TARGET", "OR", "MEMBER", "OR", "ORG_OWNER"],
  targetPath,
}: Omit<PermissionValidProps, "type">) {
  const { hasModulePermission, hasMemberTargetPermission } =
    useModulePermissionValid({
      modulePermissionsValidWay,
      modulePermissions,
      memberAuth,
      targetPath,
    });
  const hasVaildLoginIdPermission = useMemberValid(vaildLoginId);
  const hasOrgOwnerPermission = useOrgOwnerValid(shouldBeOrgOwner);

  const hasPermission = useMemo(
    () =>
      getHasPermission(conditions, {
        hasModulePermission,
        hasMemberTargetPermission,
        hasVaildLoginIdPermission,
        hasOrgOwnerPermission,
      }),
    [
      conditions,
      hasModulePermission,
      hasMemberTargetPermission,
      hasVaildLoginIdPermission,
      hasOrgOwnerPermission,
    ]
  );

  return hasPermission;
}
