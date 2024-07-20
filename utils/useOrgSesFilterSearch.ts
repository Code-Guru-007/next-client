import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationSes } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgSesFilterSearch = makePostHook<
  EntityList<OrganizationSes>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/ses", fetcher);

export default useOrgSesFilterSearch;
