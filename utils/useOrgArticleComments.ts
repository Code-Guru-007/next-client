import { OrganizationArticleComment } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  articleId?: string;
};

export const useOrgArticleCommentsMock = makeGetHook<
  EntityList<OrganizationArticleComment>,
  PathParams
>("/organizations/{{organizationId}}/articles/{{articleId}}/comments", fetcher);

const useOrgArticleComments = makeGetHook<
  EntityList<OrganizationArticleComment>,
  PathParams
>("/organizations/{{organizationId}}/articles/{{articleId}}/comments", fetcher);
export default useOrgArticleComments;
