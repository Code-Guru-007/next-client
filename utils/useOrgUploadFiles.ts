import { EntityList } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { UploadFile } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgUploadFiles = makeGetHook<EntityList<UploadFile>, PathParams>(
  "/organizations/{{organizationId}}/upload-files",
  fetcher
);

export default useOrgUploadFiles;
