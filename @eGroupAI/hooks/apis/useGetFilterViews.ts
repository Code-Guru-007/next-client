import { ServiceModuleValue } from "interfaces/utils";
import { FilterView } from "@eGroupAI/typings/apis";
import makeGetHook from "./makeGetHook";
import { fetcher } from "./fetchers";

export type PathParams = {
  organizationId?: string;
  serviceModuleValue?: ServiceModuleValue;
};

const useGetFilterViews = makeGetHook<FilterView[], PathParams>(
  "/organizations/{{organizationId}}/filter-views",
  fetcher
);

export default useGetFilterViews;
