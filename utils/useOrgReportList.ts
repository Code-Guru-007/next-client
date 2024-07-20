import { OrganizationReport } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId: string;
};

const useOrgReportList = makeGetHook<OrganizationReport[], PathParams>(
  "/organizations/{{organizationId}}/reports",
  fetcher
);

export default useOrgReportList;
