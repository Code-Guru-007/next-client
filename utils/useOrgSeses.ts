import { OrganizationSes } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgSeses = makeGetHook<EntityList<OrganizationSes>, PathParams>(
  "/organizations/{{organizationId}}/ses",
  fetcher
);
export default useOrgSeses;
