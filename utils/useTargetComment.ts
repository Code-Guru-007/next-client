import { TargetComment } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  targetTable: string;
  targetId: string;
  targetCommentId: string;
};

const useTargetComment = makeGetHook<EntityList<TargetComment>, PathParams>(
  "/organizations/{{organizationId}}/{{targetTable}}/{{targetId}}/target-comments/{{targetCommentId}}",
  fetcher
);
export default useTargetComment;
