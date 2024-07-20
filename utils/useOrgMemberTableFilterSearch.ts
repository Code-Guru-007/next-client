import {
  EntityList,
  OrganizationMember,
  FilterSearch,
} from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgMemberTableFilterSearch = makePostHook<
  EntityList<OrganizationMember>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/members", fetcher);
export default useOrgMemberTableFilterSearch;
