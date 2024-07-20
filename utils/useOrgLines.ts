import { LineEvent } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";

import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};

const useOrgLines = makeGetHook<EntityList<LineEvent>, PathParams>(
  "/organizations/{{organizationId}}/line-events",
  fetcher
);
export default useOrgLines;
