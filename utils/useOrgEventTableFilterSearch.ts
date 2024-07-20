import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationEvent } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgEventTableFilterSearch = makePostHook<
  EntityList<OrganizationEvent>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/events", fetcher);

export default useOrgEventTableFilterSearch;
