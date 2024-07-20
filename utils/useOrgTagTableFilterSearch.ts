import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationTag } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
  tagGroupId?: string;
};

const useOrgTagTableFilterSearch = makePostHook<
  EntityList<OrganizationTag>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/tags", fetcher);

export default useOrgTagTableFilterSearch;
