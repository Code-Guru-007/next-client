import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationColumn } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgDynamicColumnsFilterSearch = makePostHook<
  EntityList<OrganizationColumn>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/columns", fetcher);

export default useOrgDynamicColumnsFilterSearch;
