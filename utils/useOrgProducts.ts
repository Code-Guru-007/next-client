import { OrganizationProduct } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";
import { EntityList } from "@eGroupAI/typings/apis";

export type PathParams = {
  organizationId?: string;
};

const useOrgProducts = makeGetHook<EntityList<OrganizationProduct>, PathParams>(
  "/V4/organizations/{{organizationId}}/products",
  fetcher
);
export default useOrgProducts;
