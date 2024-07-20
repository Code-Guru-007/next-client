import { OrganizationBlog } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgBlogs = makeGetHook<EntityList<OrganizationBlog>, PathParams>(
  "/V4/organizations/{{organizationId}}/blogs",
  fetcher
);
export default useOrgBlogs;
