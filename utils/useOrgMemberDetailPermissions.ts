import { EntityList } from "@eGroupAI/typings/apis";
import { UserDetailPermission } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";

export type PathParams = {
  organizationId?: string;
  targetId?: string;
  serviceModuleValue?: string;
};
const useOrgMemberDetailPermissions = makeGetHook<
  EntityList<UserDetailPermission>,
  PathParams
>(
  "/organizations/{{organizationId}}/members/{{serviceModuleValue}}/targets/{{targetId}}/modules",
  fetcher
);
export default useOrgMemberDetailPermissions;
