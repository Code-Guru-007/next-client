import { EntityList, OrganizationMember } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgMembers = makeGetHook<EntityList<OrganizationMember>, PathParams>(
  "/organizations/{{organizationId}}/members",
  fetcher
);
export default useOrgMembers;
