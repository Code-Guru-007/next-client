import React from "react";
import {
  ModulePermission,
  ServiceMainModule,
  ServiceModule,
  EntityList,
  OrganizationModule,
  ServiceModuleMap,
} from "@eGroupAI/typings/apis";
import unique from "@eGroupAI/utils/unique";

export default function useModulePermissionHandler(
  setValues: React.Dispatch<React.SetStateAction<ServiceModuleMap | undefined>>,
  orgModules?: EntityList<OrganizationModule>
) {
  const handleAllModuleChange = (checked: boolean) => {
    if (checked) {
      const next = orgModules?.source
        .map((el) => el.serviceMainModule.serviceModuleList || [])
        .reduce((a, b) => [...a, ...b])
        .map((el) => ({
          [el.serviceModuleId]: el.serviceModulePermissionList,
        }))
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
      setValues(next);
    } else {
      setValues({});
    }
  };

  const handleMainModuleChange = (checked: boolean, mm: ServiceMainModule) => {
    setValues((val) => {
      if (!val) return undefined;
      const next = mm.serviceModuleList
        ?.map((el) => ({
          [el.serviceModuleId]: checked
            ? [...el.serviceModulePermissionList]
            : [],
        }))
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
      return {
        ...val,
        ...next,
      };
    });
  };

  const handleModuleChange = (checked: boolean, m: ServiceModule) => {
    setValues((val) => {
      if (!val) return undefined;
      return {
        ...val,
        [m.serviceModuleId]: checked ? [...m.serviceModulePermissionList] : [],
      };
    });
  };

  const handleModulePermissionChange = (
    checked: boolean,
    m: ServiceModule,
    p: ModulePermission
  ) => {
    setValues((val) => {
      if (!val) return undefined;
      const prev = val[m.serviceModuleId] || [];
      return {
        ...val,
        [m.serviceModuleId]: checked
          ? unique([...prev, p])
          : prev.filter((el) => el !== p),
      };
    });
  };

  return {
    handleAllModuleChange,
    handleMainModuleChange,
    handleModuleChange,
    handleModulePermissionChange,
  };
}
