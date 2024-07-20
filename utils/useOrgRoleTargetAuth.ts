import { RoleTargetAuth } from "interfaces/entities";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};
const useOrgRoleTargetAuth = makeGetHook<RoleTargetAuth, PathParams>(
  "/member/organizations/{{organizationId}}/role-target-auth/column-groups",
  fetcher
);
export default useOrgRoleTargetAuth;
