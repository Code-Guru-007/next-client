import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeInfinitePostHook from "@eGroupAI/hooks/apis/makeInfinitePostHook";
import { OrganizationEvent } from "interfaces/entities";

export type PathParams = {
  organizationId?: string;
};

const useOrgEventFilterSearch = makeInfinitePostHook<
  EntityList<OrganizationEvent>,
  PathParams,
  FilterSearch
>(
  "/organizations/{{organizationId}}/search/events",
  fetcher,
  (data) => data?.data.source.length === 0,
  undefined,
  undefined,
  undefined,
  {
    revalidateFirstPage: false,
  }
);

export default useOrgEventFilterSearch;
