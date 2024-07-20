import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import { Bulletin } from "interfaces/entities";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  bulletinId?: string;
};
const useBulltein = makeGetHook<Bulletin, PathParams>(
  "/organizations/{{organizationId}}/bulletins/{{bulletinId}}",
  fetcher
);
export default useBulltein;
