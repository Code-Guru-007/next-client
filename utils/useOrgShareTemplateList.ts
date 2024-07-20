import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { ShareTemplateSearch } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgShareTemplates = makePostHook<
  EntityList<ShareTemplateSearch>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/share-templates", fetcher);

export default useOrgShareTemplates;
