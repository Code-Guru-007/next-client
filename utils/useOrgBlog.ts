import { OrganizationBlog } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationBlogId?: string;
};

const useOrgBlog = makeGetHook<OrganizationBlog, PathParams>(
  "/V4/organizations/{{organizationId}}/blogs/{{organizationBlogId}}",
  fetcher
);
export default useOrgBlog;
