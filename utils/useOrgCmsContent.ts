import { OrganizationCmsContent } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationCmsContentId?: string;
};

const useOrgCmsContent = makeGetHook<OrganizationCmsContent, PathParams>(
  "/V4/organizations/{{organizationId}}/cms-contents/{{organizationCmsContentId}}",
  fetcher
);
export default useOrgCmsContent;
