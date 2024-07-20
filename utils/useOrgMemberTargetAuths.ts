import { OrganizationMemberTargetAuth } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { EntityList } from "@eGroupAI/typings/apis";

export type PathParams = {
  organizationId?: string;
};
const useOrgMemberTargetAuths = makeGetHook<
  EntityList<OrganizationMemberTargetAuth>,
  PathParams
>("/organizations/{{organizationId}}/member-target-auths", fetcher);
export default useOrgMemberTargetAuths;
