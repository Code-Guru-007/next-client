import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationSms } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgSmsFilterSearch = makePostHook<
  EntityList<OrganizationSms>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/sms", fetcher);

export default useOrgSmsFilterSearch;
