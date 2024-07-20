import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationTag } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  tagGroupId?: string;
  tagId?: string;
};
const useOrgTag = makeGetHook<OrganizationTag, PathParams>(
  "/organizations/{{organizationId}}/tag-groups/{{tagGroupId}}/tags/{{tagId}}",
  fetcher
);
export default useOrgTag;
