import { OrganizationRecordTarget } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgRecordTargets = makeGetHook<OrganizationRecordTarget[], PathParams>(
  "/organizations/{{organizationId}}/record-targets",
  fetcher
);
export default useOrgRecordTargets;
