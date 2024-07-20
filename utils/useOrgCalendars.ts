import { OrganizationCalendar } from "interfaces/entities";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
};
const useOrgCalendars = makeGetHook<OrganizationCalendar[], PathParams>(
  "/organizations/{{organizationId}}/calendars",
  fetcher
);
export default useOrgCalendars;
