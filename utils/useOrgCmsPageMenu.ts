import { OrganizationCmsPageMenu } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgCmsPageMenu = makeGetHook<
  EntityList<OrganizationCmsPageMenu>,
  PathParams
>("/V4/organizations/{{organizationId}}/cms-page-menus", fetcher);
export default useOrgCmsPageMenu;
