import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { EntityList, ServiceModule } from "@eGroupAI/typings/apis";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

const useServiceModules = makeGetHook<EntityList<ServiceModule>>(
  "/service-modules",
  fetcher
);

export default useServiceModules;
