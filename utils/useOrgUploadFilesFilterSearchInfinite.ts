import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeInfinitePostHook from "@eGroupAI/hooks/apis/makeInfinitePostHook";
import { UploadFile } from "interfaces/entities";

export type PathParams = {
  organizationId?: string;
};

const useOrgUploadFilesFilterSearchInfinite = makeInfinitePostHook<
  EntityList<UploadFile>,
  PathParams,
  FilterSearch
>(
  "/organizations/{{organizationId}}/search/files",
  fetcher,
  (data) => data?.data.source.length === 0,
  undefined,
  undefined,
  undefined,
  {
    revalidateFirstPage: false,
  },
  ""
);

export default useOrgUploadFilesFilterSearchInfinite;
