import { useMemo, useState } from "react";

import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  EntityList,
  ModulePermission,
  OrganizationMemberRole,
  OrganizationModule,
} from "@eGroupAI/typings/apis";
import useOrgMemberModules from "./useOrgMemberModules";
import useOrgModules from "./useOrgModules";

type Permissions<ServiceModuleValue extends string> = {
  [key in ServiceModuleValue]?: (keyof typeof ModulePermission)[];
};

export default function useOrgMemberPermissions<
  ServiceModuleValue extends string
>(): [Permissions<ServiceModuleValue>, string[]] {
  const organizationId = useSelector(getSelectedOrgId);
  const [orgModules, setOrgModules] =
    useState<EntityList<OrganizationModule>>();
  const { data: orgModulesData } = useOrgModules(
    {
      organizationId,
    },
    undefined,
    undefined,
    !!orgModules
  );
  if (orgModulesData) {
    setOrgModules(orgModulesData);
  }

  const [modules, setModules] = useState<OrganizationMemberRole[]>();
  const { data: modulesData } = useOrgMemberModules(
    {
      organizationId,
    },
    undefined,
    undefined,
    !!modules
  );
  if (modulesData) {
    setModules(modulesData);
  }

  const permissions = useMemo(() => {
    if (modules) {
      return modules.reduce<Permissions<ServiceModuleValue>>(
        (p, c) => ({
          ...p,
          [c.organizationRole.serviceModule.serviceModuleValue]:
            c.organizationRoleModulePermissionList,
        }),
        {}
      );
    }
    return {};
  }, [modules]);

  const serviceModuleValues = useMemo(() => {
    if (orgModules) {
      return orgModules.source
        .map((el) => el.serviceMainModule.serviceModuleList || [])
        .reduce((a, b) => [...a, ...b], [])
        .map((el) => el.serviceModuleValue);
    }
    return [];
  }, [orgModules]);

  return [permissions, serviceModuleValues];
}
