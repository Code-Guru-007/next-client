import { OrganizationSms } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgSmses = makeGetHook<EntityList<OrganizationSms>, PathParams>(
  "/organizations/{{organizationId}}/sms",
  fetcher
);
export default useOrgSmses;
