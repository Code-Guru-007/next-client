import { OrganizationMemberGroup, EntityList } from "@eGroupAI/typings/apis";
import makeGetHook from "./makeGetHook";
import { fetcher } from "./fetchers";

export type PathParams = {
  organizationId?: string;
  loginId?: string;
};
const useOrgMemberGroups = makeGetHook<
  EntityList<OrganizationMemberGroup>,
  PathParams
>("/organizations/{{organizationId}}/members/{{loginId}}/groups", fetcher);
export default useOrgMemberGroups;
