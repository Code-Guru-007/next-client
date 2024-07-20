import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { Bulletin } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useBulletinTableFilterSearch = makePostHook<
  EntityList<Bulletin>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/bulletins", fetcher);

export default useBulletinTableFilterSearch;
