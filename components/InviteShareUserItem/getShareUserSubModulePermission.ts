import { ServiceSubModule } from "@eGroupAI/typings/apis";

export default function getShareUserSubModulePermission(
  subModuleName: string,
  subModuleList: ServiceSubModule[]
) {
  const infoModule = subModuleList.filter(
    (subModule) =>
      subModule.serviceSubModuleNameEn.toLowerCase() ===
      subModuleName.toLowerCase()
  )[0];

  if (
    infoModule?.serviceSubModulePermission?.includes("WRITE") ||
    infoModule?.serviceSubModulePermission?.includes("DELETE") ||
    Object.keys(infoModule?.permissionMap || {})?.includes("WRITE") ||
    Object.keys(infoModule?.permissionMap || {})?.includes("DELETE")
  )
    return "edit";

  if (
    infoModule?.serviceSubModulePermission?.includes("READ") ||
    Object.keys(infoModule?.permissionMap || {})?.includes("READ")
  )
    return "view";

  return "none";
}
