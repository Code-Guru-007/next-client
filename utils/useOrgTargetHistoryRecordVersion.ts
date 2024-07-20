import { OrganizationTargetHistoryRecord } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher, mockFetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId: string;
  serviceModuleValue: string;
  targetId: string;
  recordId: string;
};

export const useOrgTargetHistoryRecordVersionMock = makeGetHook<
  EntityList<OrganizationTargetHistoryRecord>,
  PathParams
>(
  "/organizations/4aba77788ae94eca8d6ff330506af944/articles/3f720865bae3489f99db7582f024fff2/target-history-records/b63cf803d36d46ac947b7984a0fec4ef",
  mockFetcher
);

const useOrgTargetHistoryRecordVersion = makeGetHook<
  OrganizationTargetHistoryRecord,
  PathParams
>(
  "/organizations/{{organizationId}}/{{serviceModuleValue}}/{{targetId}}/target-history-records/{{recordId}}",
  fetcher
);

export default useOrgTargetHistoryRecordVersion;
