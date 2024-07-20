import { useMemo } from "react";
import { MbscResource } from "@mobiscroll/react";
import { OrganizationCalendar } from "interfaces/entities";

export default function useResources(orgCalendars?: OrganizationCalendar[]) {
  const resources: MbscResource[] | undefined = useMemo(
    () =>
      orgCalendars?.map((el) => ({
        id: el.organizationCalendarId,
        name: el.organizationCalendarName,
        color: el.organizationCalendarBackgroundColor,
      })),
    [orgCalendars]
  );

  return resources;
}
