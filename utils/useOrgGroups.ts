import { EntityList } from "@eGroupAI/typings/apis";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationGroup } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};
const useOrgGroups = makeGetHook<EntityList<OrganizationGroup>, PathParams>(
  "/organizations/{{organizationId}}/groups",
  fetcher
);
export default useOrgGroups;
