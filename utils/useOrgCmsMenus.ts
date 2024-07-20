import { OrganizationCmsMenu } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgCmsMenus = makeGetHook<EntityList<OrganizationCmsMenu>, PathParams>(
  "/V4/organizations/{{organizationId}}/cms-menus",
  fetcher
);
export default useOrgCmsMenus;
