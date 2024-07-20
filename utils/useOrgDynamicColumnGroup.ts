import { ColumnGroup } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationColumnGroupId?: string;
};

const useOrgDynamicColumnGroup = makeGetHook<ColumnGroup, PathParams>(
  "/organizations/{{organizationId}}/column-groups/{{organizationColumnGroupId}}",
  fetcher
);
export default useOrgDynamicColumnGroup;
