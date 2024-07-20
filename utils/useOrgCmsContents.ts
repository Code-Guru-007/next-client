import { OrganizationCmsContent } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgCmsContents = makeGetHook<
  EntityList<OrganizationCmsContent>,
  PathParams
>("/V4/organizations/{{organizationId}}/cms-contents", fetcher);
export default useOrgCmsContents;
