import { OrganizationMemberTargetAuth } from "interfaces/entities";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationMemberTargetAuthId?: string;
};
const useOrgMemberTargetAuth = makeGetHook<
  OrganizationMemberTargetAuth,
  PathParams
>(
  "/organizations/{{organizationId}}/member-target-auths/{{organizationMemberTargetAuthId}}",
  fetcher
);
export default useOrgMemberTargetAuth;
