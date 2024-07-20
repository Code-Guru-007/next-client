import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationSesTemplate } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationSesTemplateId?: string;
};
const useSESTemplateId = makeGetHook<OrganizationSesTemplate, PathParams>(
  "/organizations/{{organizationId}}/ses-templates/{{organizationSesTemplateId}}",
  fetcher
);
export default useSESTemplateId;
