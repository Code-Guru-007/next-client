import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { EntityList } from "@eGroupAI/typings/apis";
import { OrganizationTag } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  tagGroupId?: string;
};

const useOrgTags = makeGetHook<EntityList<OrganizationTag>, PathParams>(
  "/organizations/{{organizationId}}/tag-groups/{{tagGroupId}}/tags",
  fetcher
);
export default useOrgTags;
