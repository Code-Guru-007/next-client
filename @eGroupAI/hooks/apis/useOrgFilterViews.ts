import { FilterView } from "@eGroupAI/typings/apis";

import makeGetHook from "./makeGetHook";
import { fetcher } from "./fetchers";

export type PathParams = {
  organizationId: string;
};

const useOrgFilterViews = makeGetHook<FilterView[], PathParams>(
  `/organizations/{{organizationId}}/filter-views`,
  fetcher
);

export default useOrgFilterViews;
