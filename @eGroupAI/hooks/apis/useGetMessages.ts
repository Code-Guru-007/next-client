import {
  EntityList,
  FilterMessageSearch,
  MessageItem,
} from "@eGroupAI/typings/apis";
import makePostHook from "./makePostHook";
import { fetcher } from "./fetchers";

export type PathParams = {
  organizationId?: string;
};

const useGetMessages = makePostHook<
  EntityList<MessageItem>,
  PathParams,
  FilterMessageSearch
>("/organizations/{{organizationId}}/search/messages", fetcher);

export default useGetMessages;
