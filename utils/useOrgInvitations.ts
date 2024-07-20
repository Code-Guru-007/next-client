import { OrganizationInvitation } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgInvitations = makeGetHook<
  EntityList<OrganizationInvitation>,
  PathParams
>("/organizations/{{organizationId}}/invitations", fetcher);
export default useOrgInvitations;
