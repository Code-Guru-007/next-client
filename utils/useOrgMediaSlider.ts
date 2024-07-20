import { OrganizationMediaSlider } from "interfaces/entities";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationMediaSliderId?: string;
};

const useOrgMediaSlider = makeGetHook<OrganizationMediaSlider, PathParams>(
  "/V4/organizations/{{organizationId}}/media-sliders/{{organizationMediaSliderId}}",
  fetcher
);
export default useOrgMediaSlider;
