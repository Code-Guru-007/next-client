import makeGetHook from "./makeGetHook";
import { fetcher } from "./fetchers";

export type PathParams = {
  organizationId?: string;
};
const useGetUnreadMessageCounts = makeGetHook<number, PathParams>(
  "/member/organizations/{{organizationId}}/messages/unread-counts",
  fetcher
);

export default useGetUnreadMessageCounts;
