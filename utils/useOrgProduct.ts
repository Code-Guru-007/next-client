import { OrganizationProduct } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationProductId?: string;
};

const useOrgProduct = makeGetHook<OrganizationProduct, PathParams>(
  "/V4/organizations/{{organizationId}}/products/{{organizationProductId}}",
  fetcher
);
export default useOrgProduct;
