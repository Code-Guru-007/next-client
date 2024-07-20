import { Organization } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useMemberOrgInfo = makeGetHook<Organization, PathParams>(
  "/member/organizations/{{organizationId}}",
  fetcher
);
export default useMemberOrgInfo;
