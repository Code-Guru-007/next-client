import { PermissionMember } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationUserId?: string;
};

const useOrgPermissionMembers = makeGetHook<PermissionMember[], PathParams>(
  "/organizations/{{organizationId}}/users/{{organizationUserId}}/permission",
  fetcher
);
export default useOrgPermissionMembers;
