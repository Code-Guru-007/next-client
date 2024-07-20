import {
  ServiceModuleMap,
  OrganizationModule,
  ServiceMainModule,
} from "@eGroupAI/typings/apis";

export const getMainModuleChecked = (
  values: ServiceModuleMap,
  serviceMainModule: ServiceMainModule
): boolean => {
  if (!serviceMainModule.serviceModuleList) return false;
  let result = true;
  for (let i = 0; i < serviceMainModule.serviceModuleList.length; i += 1) {
    const mainModule = serviceMainModule.serviceModuleList[i];
    if (
      mainModule &&
      values[mainModule.serviceModuleId]?.length !==
        mainModule?.serviceModulePermissionList?.length
    ) {
      result = false;
      break;
    }
  }
  return result;
};

export const getMainModulePartialChecked = (
  values: ServiceModuleMap,
  serviceMainModule: ServiceMainModule
) => {
  if (!serviceMainModule.serviceModuleList) return false;
  let result = false;
  for (let i = 0; i < serviceMainModule.serviceModuleList.length; i += 1) {
    const mainModule = serviceMainModule.serviceModuleList[i];
    if (mainModule) {
      const m = values[mainModule.serviceModuleId];
      if (m !== undefined && m.length > 0) {
        result = true;
        break;
      }
    }
  }
  return result;
};

export const getAllModuleChecked = (
  values?: ServiceModuleMap,
  modules?: OrganizationModule[]
): boolean => {
  if (!values || !modules) return false;
  let result = true;
  for (let i = 0; i < modules.length; i += 1) {
    const mm = modules[i]?.serviceMainModule;
    if (mm) {
      result = getMainModuleChecked(values, mm);
    }
    if (!result) {
      break;
    }
  }
  return result;
};

export const getAllModulePartialChecked = (
  values?: ServiceModuleMap,
  modules?: OrganizationModule[]
): boolean => {
  if (!values || !modules) return false;
  let result = false;
  for (let i = 0; i < modules.length; i += 1) {
    const mm = modules[i]?.serviceMainModule;
    if (mm) {
      result = getMainModulePartialChecked(values, mm);
    }
    if (result) {
      break;
    }
  }
  return result;
};
