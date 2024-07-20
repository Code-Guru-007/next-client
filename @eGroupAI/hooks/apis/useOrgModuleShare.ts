import { OrganizationModuleShare } from "@eGroupAI/typings/apis";
import makeGetHook from "./makeGetHook";
import { fetcher, mockFetcher } from "./fetchers";

interface PathParams {
  organizationId: string;
  shareId: string;
}

export const useOrgModuleShareMock = makeGetHook<
  OrganizationModuleShare,
  PathParams
>("/organizations/{{organizationId}}/shares/{{shareId}}", mockFetcher);

const useOrgModuleShare = makeGetHook<OrganizationModuleShare, PathParams>(
  "/organizations/{{organizationId}}/shares/{{shareId}}",
  fetcher
);

export default useOrgModuleShare;
