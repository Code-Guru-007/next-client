import { ColumnTemplate } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationColumnTemplateId?: string;
};

const useOrgDynamicColumnTemplate = makeGetHook<ColumnTemplate, PathParams>(
  "/organizations/{{organizationId}}/column-templates/{{organizationColumnTemplateId}}",
  fetcher
);
export default useOrgDynamicColumnTemplate;
