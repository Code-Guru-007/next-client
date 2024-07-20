import { EntityList, FilterSearch, MessageItem } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useMessageFilterSearch = makePostHook<
  EntityList<MessageItem>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/messages", fetcher);

export default useMessageFilterSearch;
