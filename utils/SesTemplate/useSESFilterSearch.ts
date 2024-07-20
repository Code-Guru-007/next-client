import { EntityList } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationSesTemplate } from "interfaces/entities";
import makePostHook from "@eGroupAI/hooks/apis/makePostHook";

export type PathParams = {
  organizationId?: string;
};

const useSESFilterSearch = makePostHook<
  EntityList<OrganizationSesTemplate>,
  PathParams
>("/organizations/{{organizationId}}/search/ses-template", fetcher);

export default useSESFilterSearch;
