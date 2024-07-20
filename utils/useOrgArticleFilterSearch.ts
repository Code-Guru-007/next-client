import { EntityList, FilterSearch } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationArticle } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgArticleFilterSearch = makePostHook<
  EntityList<OrganizationArticle>,
  PathParams,
  FilterSearch
>("/organizations/{{organizationId}}/search/articles", fetcher);

export default useOrgArticleFilterSearch;
