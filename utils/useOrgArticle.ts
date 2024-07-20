import { OrganizationArticle } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  articleId?: string;
};

const useOrgArticle = makeGetHook<OrganizationArticle, PathParams>(
  "/organizations/{{organizationId}}/articles/{{articleId}}",
  fetcher
);
export default useOrgArticle;
