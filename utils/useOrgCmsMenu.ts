import { OrganizationCmsMenu } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationCmsMenuId?: string;
};

const useOrgCmsMenu = makeGetHook<OrganizationCmsMenu, PathParams>(
  "/V4/organizations/{{organizationId}}/cms-menus/{{organizationCmsMenuId}}",
  fetcher
);
export default useOrgCmsMenu;
