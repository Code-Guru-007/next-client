import useUserPermission from "@eGroupAI/hooks/apis/useUserPermission";
import { UserPermissionValidProps } from "./typings";

const useUserPermissionValid = function ({
  organizationId,
  organizationUserId,
  serviceModuleValue,
  serviceSubModuleValue,
  conditions = ["READ", "DELETE", "WRITE"],
  conditionType = "OR",
}: UserPermissionValidProps) {
  const { data } = useUserPermission({
    organizationId,
    serviceModuleValue,
    targetId: organizationUserId,
  });

  let hasPermission = false;

  if (!data) {
    return hasPermission;
  }

  const subModule = data.filter(
    (d) => d.serviceSubModuleValue === serviceSubModuleValue
  )[0];
  if (!subModule) {
    return hasPermission;
  }

  if (subModule) {
    if (conditionType === "OR") {
      for (let cond = 0; cond < conditions.length; cond++) {
        if (subModule.permissionMap[cond] === "ROLE") {
          hasPermission = true;
          break;
        }
      }
    } else {
      conditions.forEach((cond) => {
        if (subModule.permissionMap[cond] === "ROLE") {
          hasPermission = true;
        }
      });
    }
  }
  return hasPermission;
};

export default useUserPermissionValid;
