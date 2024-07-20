import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationGroup } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgGroupTableFilterSearch = makePostHook<
  EntityList<OrganizationGroup>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/groups", fetcher);

export default useOrgGroupTableFilterSearch;
