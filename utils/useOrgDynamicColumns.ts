import { OrganizationColumn } from "interfaces/entities";
import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgDynamicColumns = makeGetHook<
  EntityList<OrganizationColumn>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/columns", fetcher);
export default useOrgDynamicColumns;
