import { OrganizationSesTemplate } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useSESTemplate = makeGetHook<
  EntityList<OrganizationSesTemplate>,
  PathParams
>("/organizations/{{organizationId}}/ses-templates", fetcher);
export default useSESTemplate;
