import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { ShareReurl } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
  organizationShareShortUrl?: string;
};
const useShareReurl = makePostHook<ShareReurl, PathParams>(
  "/organizations/{{organizationId}}/share-reurl/{{organizationShareShortUrl}}/preview",
  fetcher
);
export default useShareReurl;
