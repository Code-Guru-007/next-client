import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { ColumnGroup } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgDynamicColumnGroupsFilterSearch = makePostHook<
  EntityList<ColumnGroup>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/column-groups", fetcher);

export default useOrgDynamicColumnGroupsFilterSearch;
