import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationPartner } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgPartnerFilterSearch = makePostHook<
  EntityList<OrganizationPartner>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/partners", fetcher);

export default useOrgPartnerFilterSearch;
