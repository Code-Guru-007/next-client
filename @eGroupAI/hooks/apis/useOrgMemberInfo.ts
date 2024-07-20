import { OrganizationMember } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  memberLoginId?: string;
};

const useOrgMemberInfo = makeGetHook<OrganizationMember, PathParams>(
  "/organizations/{{organizationId}}/members/{{memberLoginId}}",
  fetcher
);
export default useOrgMemberInfo;
