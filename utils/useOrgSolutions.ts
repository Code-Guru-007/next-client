import { OrganizationSolution } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgSolutions = makeGetHook<
  EntityList<OrganizationSolution>,
  PathParams
>("/V4/organizations/{{organizationId}}/solutions", fetcher);
export default useOrgSolutions;
