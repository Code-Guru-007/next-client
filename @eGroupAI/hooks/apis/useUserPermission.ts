import { UserModulePermission } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

const useUserPermission = makeGetHook<UserModulePermission[]>(
  "/member/organizations/{{organizationId}}/{{serviceModuleValue}}/targets/{{targetId}}/modules",
  fetcher
);
export default useUserPermission;
