import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationTagGroup } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgTagGroupTableFilterSearch = makePostHook<
  EntityList<OrganizationTagGroup>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/tag-groups", fetcher);

export default useOrgTagGroupTableFilterSearch;
