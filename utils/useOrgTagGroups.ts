import { OrganizationTagGroup } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgTagGroups = makeGetHook<
  EntityList<OrganizationTagGroup>,
  PathParams
>("/organizations/{{organizationId}}/tag-groups", fetcher);
export default useOrgTagGroups;
