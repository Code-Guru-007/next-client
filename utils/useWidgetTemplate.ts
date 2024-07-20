import { WidgetTemplateDetail } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId: string;
  widgetTemplateId: string;
};

const useWidgetTemplateDetail = makeGetHook<WidgetTemplateDetail, PathParams>(
  "/organizations/{{organizationId}}/widget-templates/{{widgetTemplateId}}",
  fetcher
);

export default useWidgetTemplateDetail;
