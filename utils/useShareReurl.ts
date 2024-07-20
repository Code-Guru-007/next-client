import { fetcher, mockFetcher } from "@eGroupAI/hooks/apis/fetchers";
import { ShareReurl } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationShareShortUrl?: string;
};

export const useShareReurlMock = makeGetHook<ShareReurl, PathParams>(
  "/share-reurl/f655K7",
  mockFetcher
);

export const useShareReurl = makeGetHook<ShareReurl, PathParams>(
  "/share-reurl/{{organizationShareShortUrl}}",
  fetcher
);

export default useShareReurl;
