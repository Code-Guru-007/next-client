import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationGroup } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationGroupId?: string;
};
const useOrgGroup = makeGetHook<OrganizationGroup, PathParams>(
  "/organizations/{{organizationId}}/groups/{{organizationGroupId}}",
  fetcher
);
export default useOrgGroup;
