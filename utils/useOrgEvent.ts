import { OrganizationEvent } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationEventId?: string;
};

const useOrgEvent = makeGetHook<OrganizationEvent, PathParams>(
  "/organizations/{{organizationId}}/events/{{organizationEventId}}",
  fetcher
);
export default useOrgEvent;
