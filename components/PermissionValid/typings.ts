import { Dispatch, SetStateAction } from "react";
import { UseModulePermissionValidArgs } from "./useModulePermissionValid";
import { ValidComponentWrapperProps } from "./ValidComponentWrapper";

export interface PermissionValidProps extends UseModulePermissionValidArgs {
  /**
   * Give loginId need to be validated.
   * If vaildLoginId is the same with current member loginId then has permission.
   */
  vaildLoginId?: string;
  /**
   * If org creator loginId is the same with current member loginId then has permission.
   */
  shouldBeOrgOwner?: boolean;
  /**
   * Button status without permission.
   */
  type?: ValidComponentWrapperProps["type"];
  /**
   * Condition of `ValidComponentWrapper` hasPermission.
   */
  conditions?: Condition[];
  /**
   * setHasPermissions for PermissionValidGroup
   */
  setHasPermissions?: Dispatch<SetStateAction<boolean[]>>;
  /**
   * use sepcific target permission setting
   */
  specifiedTargetPermission?: boolean;
}

export type Condition =
  | "AND"
  | "OR"
  | "MODULE"
  | "TARGET"
  | "MEMBER"
  | "ORG_OWNER";

export type Results = {
  hasModulePermission: boolean;
  hasMemberTargetPermission: boolean;
  hasVaildLoginIdPermission: boolean;
  hasOrgOwnerPermission: boolean;
};

export interface UserPermissionValidProps {
  organizationId: string;
  organizationUserId: string;
  serviceModuleValue: string;
  serviceSubModuleValue: string;
  conditions?: string[];
  conditionType?: "OR" | "AND";
  type?: "hidden" | "disabled";
}
