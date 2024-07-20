import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type SearchTextRecordReturnType = "AUTOCOMPLETE" | "HISTORY";

export type Data = {
  searchTextRecordReturnType: SearchTextRecordReturnType;
  searchTextRecordList: {
    searchTextRecordQuery: string;
  }[];
};

export type PathParams = {
  organizationId?: string;
};

const useOrgSearchTextRecords = makeGetHook<Data, PathParams>(
  "/member/organizations/{{organizationId}}/search-text-records",
  fetcher
);
export default useOrgSearchTextRecords;
