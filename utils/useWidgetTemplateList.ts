import { WidgetTemplate } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId: string;
};

const useWidgetTemplateList = makePostHook<WidgetTemplate[], PathParams>(
  "/organizations/{{organizationId}}/widget-templates/list",
  fetcher
);

export default useWidgetTemplateList;
