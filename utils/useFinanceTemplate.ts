import { OrganizationFinanceTemplate } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationFinanceTemplateId?: string;
};

const useFinanceTemplate = makeGetHook<OrganizationFinanceTemplate, PathParams>(
  "/finance-templates/{{organizationFinanceTemplateId}}",
  fetcher
);
export default useFinanceTemplate;
