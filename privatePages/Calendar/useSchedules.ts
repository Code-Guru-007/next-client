import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AxiosPromise } from "axios";
import { OrganizationEvent, OrganizationCalendar } from "interfaces/entities";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { MbscCalendarEvent } from "@mobiscroll/react";
import { FilterSearch } from "@eGroupAI/typings/apis";

export const parseSchedule = (
  el: OrganizationEvent,
  orgCalendars?: OrganizationCalendar[]
): MbscCalendarEvent => {
  const allDay = el.isDateOnly === 1;
  const calendar = orgCalendars?.find(
    (cal) =>
      cal.organizationCalendarId ===
      el.organizationCalendar?.organizationCalendarId
  );
  return {
    id: el.organizationCalendarEventId,
    eventId: el.organizationEventId,
    resource: el.organizationCalendar?.organizationCalendarId,
    text: el.organizationEventTitle,
    description: el.organizationEventDescription,
    start: new Date(el.organizationEventStartDate),
    end: allDay ? undefined : new Date(el.organizationEventEndDate),
    allDay,
    color: calendar?.organizationCalendarBackgroundColor,
    isDefaultCalendar: calendar?.isDefault,
    recurring: el.recurrence?.shift()?.replace("RRULE:", ""),
  };
};

export interface UseSchedulesArgs {
  organizationId: string;
  orgCalendarIds: string[];
  oauthCalendarIds: string[];
  startDate?: Date;
  endDate?: Date;
  orgCalendars?: OrganizationCalendar[];
  query?: string;
  filterSearch?: FilterSearch;
}

export default function useSchedules({
  organizationId,
  orgCalendarIds,
  oauthCalendarIds,
  startDate,
  endDate,
  orgCalendars,
  filterSearch,
}: UseSchedulesArgs) {
  const { excute: getOrgCalendarEvents } = useAxiosApiWrapper(
    apis.org.getOrgCalendarEvents,
    "None"
  );
  const { excute: getOauthCalendarEvents } = useAxiosApiWrapper(
    apis.org.getOauthCalendarEvents,
    "None"
  );
  const [schedules, setSchedules] = useState<MbscCalendarEvent[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const fetching = useRef(false);

  useEffect(() => {
    if (
      !organizationId ||
      !startDate ||
      !endDate ||
      !orgCalendars ||
      orgCalendars.length === 0
    )
      return;
    const getEvents = async () => {
      if (
        (!orgCalendarIds && !oauthCalendarIds) ||
        (orgCalendarIds.length === 0 && oauthCalendarIds.length === 0)
      )
        return;
      const promises: AxiosPromise<OrganizationEvent[]>[] = [];
      orgCalendarIds.forEach((id) => {
        promises.push(
          getOrgCalendarEvents({
            organizationId,
            organizationCalendarId: id,
            eventStartDateString: startDate.toISOString(),
            eventEndDateString: endDate.toISOString(),
            query: filterSearch?.query,
            equal: filterSearch?.equal,
            range: filterSearch?.range,
          })
        );
      });
      oauthCalendarIds.forEach((id) => {
        promises.push(
          getOauthCalendarEvents({
            organizationId,
            organizationCalendarId: id,
            eventStartDateString: startDate.toISOString(),
            eventEndDateString: endDate.toISOString(),
            query: filterSearch?.query,
            equal: filterSearch?.equal,
            range: filterSearch?.range,
          })
        );
      });
      fetching.current = true;
      setIsEventsLoading(true);
      await Promise.all(promises)
        .then((values) => {
          let result: OrganizationEvent[] = [];
          values.forEach((el) => {
            result = [...result, ...el.data];
          });
          setSchedules(result.map((el) => parseSchedule(el, orgCalendars)));
        })
        .catch(() => {});
      fetching.current = false;
      setIsEventsLoading(false);
    };
    if (!fetching.current) {
      getEvents();
    }
    // remove getOrgCalendarEvents dep to avoid re trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    endDate,
    organizationId,
    startDate,
    orgCalendarIds,
    oauthCalendarIds,
    orgCalendars,
    filterSearch?.query,
    filterSearch?.equal,
    filterSearch?.range,
  ]);

  const setSchedule = useCallback(
    (calendarId: string) => {
      if (!organizationId || !startDate || !endDate) return;
      getOrgCalendarEvents({
        organizationId,
        organizationCalendarId: calendarId,
        eventStartDateString: startDate.toISOString(),
        eventEndDateString: endDate.toISOString(),
        query: filterSearch?.query,
        equal: filterSearch?.equal,
        range: filterSearch?.range,
      })
        .then((res) => {
          setSchedules((val) => [
            ...val,
            ...res.data.map((el) => parseSchedule(el, orgCalendars)),
          ]);
        })
        .catch(() => {});
      getOauthCalendarEvents({
        organizationId,
        organizationCalendarId: calendarId,
        eventStartDateString: startDate.toISOString(),
        eventEndDateString: endDate.toISOString(),
        query: filterSearch?.query,
        equal: filterSearch?.equal,
        range: filterSearch?.range,
      })
        .then((res) => {
          setSchedules((val) => [
            ...val,
            ...res.data.map((el) => parseSchedule(el, orgCalendars)),
          ]);
        })
        .catch(() => {});
    },
    [
      organizationId,
      startDate,
      endDate,
      getOrgCalendarEvents,
      filterSearch?.query,
      filterSearch?.equal,
      filterSearch?.range,
      getOauthCalendarEvents,
      orgCalendars,
    ]
  );

  const removeSchedule = useCallback((calendarId: string) => {
    setSchedules((val) => val.filter((el) => el.calendarId !== calendarId));
  }, []);

  const noneDuplicate = useMemo(() => {
    const scheduleMap: Record<string, MbscCalendarEvent> = {};
    for (let i = 0; i < schedules.length; i += 1) {
      const el = schedules[i];
      if (el && el.id) {
        scheduleMap[el.id] = el;
      }
    }
    return Object.values(scheduleMap);
  }, [schedules]);

  return {
    schedules: noneDuplicate,
    setSchedule,
    removeSchedule,
    isEventsLoading,
  };
}
