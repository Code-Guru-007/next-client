import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { ColumnTemplate } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgDynamicColumnTemplatesFilterSearch = makePostHook<
  EntityList<ColumnTemplate>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/column-templates", fetcher);

export default useOrgDynamicColumnTemplatesFilterSearch;
