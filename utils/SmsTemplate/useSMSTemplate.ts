import { OrganizationSmsTemplate } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useSMSTemplate = makeGetHook<
  EntityList<OrganizationSmsTemplate>,
  PathParams
>("/organizations/{{organizationId}}/sms-templates", fetcher);
export default useSMSTemplate;
