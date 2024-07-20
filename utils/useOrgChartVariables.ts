import { OrgChartReportVariables } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  tableModule?: string;
};

const useOrgChartVariables = makeGetHook<OrgChartReportVariables[], PathParams>(
  "/organizations/{{organizationId}}/report-variable-list/{{tableModule}}",
  fetcher
);

export default useOrgChartVariables;
