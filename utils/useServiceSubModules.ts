import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { EntityList } from "@eGroupAI/typings/apis";
import { ServiceSubModule } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  serviceModuleId?: string;
};

const useServiceSubModules = makeGetHook<
  EntityList<Omit<ServiceSubModule, "permissionMap">>,
  PathParams
>("/service-modules/{{serviceModuleId}}/service-sub-modules", fetcher);
export default useServiceSubModules;
