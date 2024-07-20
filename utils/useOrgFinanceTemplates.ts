import { OrganizationFinanceTemplate } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgFinanceTemplates = makeGetHook<
  EntityList<OrganizationFinanceTemplate>,
  PathParams
>("/organizations/{{organizationId}}/finance-templates", fetcher);
export default useOrgFinanceTemplates;
