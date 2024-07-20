import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { UploadFile } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgUploadFilesFilterSearch = makePostHook<
  EntityList<UploadFile>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/files", fetcher);

export default useOrgUploadFilesFilterSearch;
