import { OrganizationReview } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationReviewId?: string;
};

const useOrgReview = makeGetHook<OrganizationReview, PathParams>(
  "/organizations/{{organizationId}}/reviews/{{organizationReviewId}}",
  fetcher
);
export default useOrgReview;
