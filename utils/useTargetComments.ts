import { TargetComment } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher, mockFetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  targetTable: string;
  targetId: string;
};

export const useTargetCommentsMock = makeGetHook<
  EntityList<TargetComment>,
  PathParams
>(
  "/organizations/{{organizationId}}/{{targetTable}}/{{targetId}}/target-comments",
  mockFetcher
);

const useTargetComments = makeGetHook<EntityList<TargetComment>, PathParams>(
  "/organizations/{{organizationId}}/{{targetTable}}/{{targetId}}/target-comments",
  fetcher
);

export default useTargetComments;
