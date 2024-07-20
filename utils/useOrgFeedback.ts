import { OrganizationFeedback } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationFeedbackId?: string;
};

const useOrgFeedback = makeGetHook<OrganizationFeedback, PathParams>(
  "/organizations/{{organizationId}}/feedbacks/{{organizationFeedbackId}}",
  fetcher
);
export default useOrgFeedback;
