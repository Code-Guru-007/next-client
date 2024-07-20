import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationUserShare } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgUserShareFilterSearch = makePostHook<
  EntityList<OrganizationUserShare>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/user-shares", fetcher);

export default useOrgUserShareFilterSearch;
