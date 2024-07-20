import { useMemo } from "react";

import { useRouter } from "next/router";
import moduleRouteMapping from "utils/moduleRouteMapping";
import useOrgMemberPermissions from "@eGroupAI/hooks/apis/useOrgMemberPermissions";
import { ServiceModuleValue } from "interfaces/utils";
import { ModulePermission } from "@eGroupAI/typings/apis";

type ModulePermissionKeys = keyof typeof ModulePermission;
/**
 * Loop modulePermissions to find if any one module permission is included in
 * member's module permissions.
 */
const getModulePermissionAtLeastOneIncluded = (
  modulePermissions: ModulePermissionKeys[],
  memberModulePermissions?: ModulePermissionKeys[]
) => {
  let result = false;
  for (let i = 0; i < modulePermissions.length; i += 1) {
    const permission = modulePermissions[i];
    if (permission) {
      result = Boolean(memberModulePermissions?.includes(permission));
    }
    if (result) {
      break;
    }
  }
  return result;
};

/**
 * Loop modulePermissions to find if all module permissions is included in
 * member's module permissions.
 */
const getModulePermissionAllIncluded = (
  modulePermissions: ModulePermissionKeys[],
  memberModulePermissions?: ModulePermissionKeys[]
) => {
  let result = true;
  for (let i = 0; i < modulePermissions.length; i += 1) {
    const permission = modulePermissions[i];
    if (permission) {
      result = Boolean(memberModulePermissions?.includes(permission));
    }
    if (!result) {
      break;
    }
  }
  return result;
};

/**
 * Loop validPermissions to find if any one valid permission is included in
 * member's auth permissions.
 */
const getMemberAuthAtLeastOneIncluded = (
  validPermissions: ModulePermissionKeys[],
  memberAuthPermissions: ModulePermissionKeys[]
) => {
  let result = false;
  for (let i = 0; i < validPermissions.length; i += 1) {
    const permission = validPermissions[i];
    if (permission) {
      result = Boolean(memberAuthPermissions.includes(permission));
    }
    if (result) {
      break;
    }
  }
  return result;
};

/**
 * Loop validPermissions to find if all valid permissions is included in
 * member's auth permissions.
 */
const getMemberAuthAllIncluded = (
  validPermissions: ModulePermissionKeys[],
  memberAuthPermissions: ModulePermissionKeys[]
) => {
  let result = true;
  for (let i = 0; i < validPermissions.length; i += 1) {
    const permission = validPermissions[i];
    if (permission) {
      result = Boolean(memberAuthPermissions.includes(permission));
    }
    if (!result) {
      break;
    }
  }
  return result;
};

export interface UseModulePermissionValidArgs {
  /**
   * Module permission valid way.
   */
  modulePermissionsValidWay?: "OR" | "AND";
  /**
   * Give module permissions need to be validated (At least one).
   */
  modulePermissions?: ModulePermissionKeys[];
  /**
   * Give target permissions and permissions need to be validated (At least one).
   */
  memberAuth?: {
    /**
     * Auth permissions from apis which own by member.
     */
    memberAuthPermissions?: ModulePermissionKeys[];
    /**
     * Need what permissions be valid for operation.
     */
    validPermissions: ModulePermissionKeys[];
  };
  /**
   * If current router path (from useRouter asPath) can't auto mapping moduleRoute should use this.
   * For example,
   * Path is /me/event/events/:eventId
   * <PermissionValid permission="WRITE" targetPath="/me/event/events">
   *  ...
   * </PermissionValid>
   * "/me/event/events" can mapping to `EVENT` module which can find in `moduleRouteMapping`.
   */
  targetPath?: string;
}

/**
 * To vaild if has module permissions.
 * The process logic is to get current website path and use "moduleRouteMapping"
 * to get correspondence module name.
 * And then compare with member permissions.
 */
export default function useModulePermissionValid({
  modulePermissionsValidWay = "OR",
  modulePermissions,
  memberAuth,
  targetPath,
}: UseModulePermissionValidArgs) {
  const router = useRouter();
  const [memberPermissions] = useOrgMemberPermissions();

  const path = useMemo(
    () => targetPath || router.pathname,
    [router.pathname, targetPath]
  );

  /**
   * Find module by path.
   */
  const moduleByPath = useMemo(() => {
    const modules = Object.keys(moduleRouteMapping);
    let result = "";
    for (let i = 0; i < modules.length; i += 1) {
      const moduleName = modules[i];
      if (moduleName) {
        const modulePaths = moduleRouteMapping[moduleName];
        if (modulePaths?.includes(path)) {
          result = moduleName as ServiceModuleValue;
          break;
        }
      }
    }
    return result;
  }, [path]);

  /**
   * Get if has module permission which controlled by modulePermissionsValidWay.
   */
  const hasModulePermission = useMemo(() => {
    if (!modulePermissions) {
      return false;
    }
    if (modulePermissionsValidWay === "AND") {
      return getModulePermissionAllIncluded(
        modulePermissions,
        memberPermissions[moduleByPath]
      );
    }
    return getModulePermissionAtLeastOneIncluded(
      modulePermissions,
      memberPermissions[moduleByPath]
    );
  }, [
    memberPermissions,
    moduleByPath,
    modulePermissions,
    modulePermissionsValidWay,
  ]);

  /**
   * Get if has member auth permission which controlled by modulePermissionsValidWay.
   */
  const hasMemberTargetPermission = useMemo(() => {
    if (!memberAuth || !memberAuth.memberAuthPermissions) return false;
    if (modulePermissionsValidWay === "AND") {
      return getMemberAuthAllIncluded(
        memberAuth.validPermissions,
        memberAuth.memberAuthPermissions
      );
    }
    return getMemberAuthAtLeastOneIncluded(
      memberAuth.validPermissions,
      memberAuth.memberAuthPermissions
    );
  }, [memberAuth, modulePermissionsValidWay]);

  return {
    hasModulePermission,
    hasMemberTargetPermission,
  };
}
