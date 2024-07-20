import { OrganizationPartner } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgPartners = makeGetHook<EntityList<OrganizationPartner>, PathParams>(
  "/organizations/{{organizationId}}/partners",
  fetcher
);
export default useOrgPartners;
