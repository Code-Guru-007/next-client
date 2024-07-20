import { OrganizationSalaryTemplate } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationFinanceTemplateId?: string;
};

const useOrgSalaryTemplate = makeGetHook<
  OrganizationSalaryTemplate,
  PathParams
>(
  "/organizations/{{organizationId}}/finance-templates/{{organizationFinanceTemplateId}}",
  fetcher
);
export default useOrgSalaryTemplate;
