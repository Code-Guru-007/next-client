import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { OrganizationUser } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationUserId?: string;
};
const useOrgUser = makeGetHook<OrganizationUser, PathParams>(
  "/organizations/{{organizationId}}/users/{{organizationUserId}}",
  fetcher
);
export default useOrgUser;
