import {
  OrganizationTargetHistoryRecord,
  OrganizationTargetHistoryRecord_APIResponseDataType,
} from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher, mockFetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId: string;
  advancedSearchTable: string;
  targetId: string;
};

export const useOrgTargetHistoryRecordsMock = makeGetHook<
  EntityList<OrganizationTargetHistoryRecord>,
  PathParams
>(
  "/organizations/4aba77788ae94eca8d6ff330506af944/articles/3f720865bae3489f99db7582f024fff2/target-history-records",
  mockFetcher
);

const useOrgTargetHistoryRecords = makeGetHook<
  OrganizationTargetHistoryRecord_APIResponseDataType,
  PathParams
>(
  "/organizations/{{organizationId}}/{{advancedSearchTable}}/{{targetId}}/target-history-records",
  fetcher
);

export default useOrgTargetHistoryRecords;
