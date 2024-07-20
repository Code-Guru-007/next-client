import { OrganizationFeedback } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgFeedbacks = makeGetHook<
  EntityList<OrganizationFeedback>,
  PathParams
>("/organizations/{{organizationId}}/feedbacks", fetcher);
export default useOrgFeedbacks;
