import { OrganizationSolution } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationSolutionId?: string;
};

const useOrgSolution = makeGetHook<OrganizationSolution, PathParams>(
  "/V4/organizations/{{organizationId}}/solutions/{{organizationSolutionId}}",
  fetcher
);
export default useOrgSolution;
