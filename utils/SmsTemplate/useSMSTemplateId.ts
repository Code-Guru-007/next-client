import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationSmsTemplate } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationSmsTemplateId?: string;
};
const useSMSTemplateId = makeGetHook<OrganizationSmsTemplate, PathParams>(
  "/organizations/{{organizationId}}/sms-templates/{{organizationSmsTemplateId}}",
  fetcher
);
export default useSMSTemplateId;
