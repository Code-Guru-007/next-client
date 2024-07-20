import { OrganizationEvent } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgEvents = makeGetHook<EntityList<OrganizationEvent>, PathParams>(
  "/organizations/{{organizationId}}/events",
  fetcher
);
export default useOrgEvents;
