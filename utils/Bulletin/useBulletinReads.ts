import { OrganizationArticleReads } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  bulletinId?: string;
};

const useBulletinReads = makeGetHook<OrganizationArticleReads[], PathParams>(
  "/organizations/{{organizationId}}/bulletins/{{bulletinId}}/reads",
  fetcher
  // "/organizations/4aba77788ae94eca8d6ff330506af944/bulletins/20b070a2a6984b7f9f7d8e1de409ba5d/reads",
  // mockFetcher
);

export default useBulletinReads;
