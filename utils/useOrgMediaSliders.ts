import { OrganizationMediaSlider } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgMediaSliders = makeGetHook<
  EntityList<OrganizationMediaSlider>,
  PathParams
>("/V4/organizations/{{organizationId}}/media-sliders", fetcher);
export default useOrgMediaSliders;
