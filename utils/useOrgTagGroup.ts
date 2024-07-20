import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationTagGroup } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  tagGroupId?: string;
};
const useOrgTagGroup = makeGetHook<OrganizationTagGroup, PathParams>(
  "/organizations/{{organizationId}}/tag-groups/{{tagGroupId}}",
  fetcher
);
export default useOrgTagGroup;
