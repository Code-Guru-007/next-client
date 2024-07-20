import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationPartner } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationPartnerId?: string;
};
const useOrgPartner = makeGetHook<OrganizationPartner, PathParams>(
  "/organizations/{{organizationId}}/partners/{{organizationPartnerId}}",
  fetcher
);
export default useOrgPartner;
