import { OrganizationArticleReads } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  articleId?: string;
};

const useOrgArticleReads = makeGetHook<OrganizationArticleReads[], PathParams>(
  "/organizations/{{organizationId}}/articles/{{articleId}}/reads",
  fetcher
  // "/organizations/4aba77788ae94eca8d6ff330506af944/articles/3f720865bae3489f99db7582f024fff2/reads",
  // mockFetcher
);

export default useOrgArticleReads;
