import { EntityList, ShareModuleList } from "@eGroupAI/typings/apis";
import makeGetHook from "./makeGetHook";
import { fetcher, mockFetcher } from "./fetchers";

interface PathParams {
  organizationId?: string;
  serviceModuleValue?: string;
  targetId?: string;
}

export const useOrgSharePermissionUsersMock = makeGetHook<
  EntityList<ShareModuleList>,
  PathParams
>(
  "/organizations/{{organizationId}}/members/{{serviceModuleValue}}/targets/{{targetId}}/modules",
  mockFetcher
);

export const useOrgSharePermissionUsers = makeGetHook<
  EntityList<ShareModuleList>,
  PathParams
>(
  "/organizations/{{organizationId}}/members/{{serviceModuleValue}}/targets/{{targetId}}/modules",
  fetcher
);

export default useOrgSharePermissionUsers;
