import { OrganizationFinanceTarget } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgFinanceTargets = makeGetHook<
  EntityList<OrganizationFinanceTarget>,
  PathParams
>("/organizations/{{organizationId}}/finance-targets", fetcher);
export default useOrgFinanceTargets;
