import { OrganizationArticleComment } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  articleId?: string;
  articleCommentId?: string;
};

const useOrgArticleComment = makeGetHook<
  OrganizationArticleComment,
  PathParams
>(
  "/organizations/{{organizationId}}/articles/{{articleId}}/comments/{{articleCommentId}}",
  fetcher
);
export default useOrgArticleComment;
