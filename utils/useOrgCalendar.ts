import { OrganizationCalendar } from "interfaces/entities";
import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationCalendarId?: string;
};
const useOrgCalendar = makeGetHook<OrganizationCalendar, PathParams>(
  "/organizations/{{organizationId}}/calendars/{{organizationCalendarId}}",
  fetcher
);
export default useOrgCalendar;
