import { EntityList } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationSmsTemplate } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useSMSFilterSearch = makePostHook<
  EntityList<OrganizationSmsTemplate>,
  PathParams
>("/organizations/{{organizationId}}/search/sms-template", fetcher);

export default useSMSFilterSearch;
