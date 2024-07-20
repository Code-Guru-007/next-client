import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationUser } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgUserTableFilterSearch = makePostHook<
  EntityList<OrganizationUser>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/users", fetcher);

export default useOrgUserTableFilterSearch;
