import { OrgColumnRelatedData } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  serviceModuleValue?: string;
};

const useAssociatedData = makeGetHook<OrgColumnRelatedData[], PathParams>(
  "/organizations/{{organizationId}}/columns/related/{{serviceModuleValue}}/data-list",
  fetcher
);
export default useAssociatedData;
