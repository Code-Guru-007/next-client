import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgSharerOrgs = makeGetHook<
  {
    organizationId: string;
    organizationName: string;
  }[],
  PathParams
>("/organizations/{{organizationId}}/sharer-organizations", fetcher);
export default useOrgSharerOrgs;
