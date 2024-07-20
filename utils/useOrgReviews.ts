import { OrganizationReview } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgReviews = makeGetHook<EntityList<OrganizationReview>, PathParams>(
  "/organizations/{{organizationId}}/reviews",
  fetcher
);
export default useOrgReviews;
