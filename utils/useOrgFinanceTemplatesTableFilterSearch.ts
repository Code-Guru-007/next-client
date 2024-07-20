import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationFinanceTemplate } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgFinanceTemplatesFilterSearch = makePostHook<
  EntityList<OrganizationFinanceTemplate>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/finance-templates", fetcher);

export default useOrgFinanceTemplatesFilterSearch;
