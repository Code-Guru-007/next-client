import { OrganizationShare } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgShares = makeGetHook<EntityList<OrganizationShare>, PathParams>(
  "/organizations/{{organizationId}}/shares",
  fetcher
);
export default useOrgShares;
