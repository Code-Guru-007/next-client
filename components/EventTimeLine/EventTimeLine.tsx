import React, { FC } from "react";

import { format } from "@eGroupAI/utils/dateUtils";

import { OrganizationEvent } from "interfaces/entities";
import { TimelineDotProps } from "@mui/lab/TimelineDot";

import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/styles";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import EventContent from "./EventContent";
import EventDate from "./EventDate";
import StyledTimelineDot from "./StyledTimelineDot";

export interface EventTimeLineProps {
  data?: OrganizationEvent[];
  formatHref?: (eventId: string) => string;
}

const EventTimeLine: FC<EventTimeLineProps> = function (props) {
  const { data, formatHref } = props;
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Timeline
      position="alternate"
      sx={{
        width: isDownSm ? undefined : "75%",
        m: "auto",
        padding: isDownSm ? "0" : "40px",
      }}
    >
      {data?.map((el, index) => {
        const startDate = new Date(el.organizationEventCreateDate);
        const endDate = new Date(el.organizationEventEndDate);
        const month = format(startDate, "do");
        const day = format(startDate, "MMM");
        const time = format(startDate, "HH:mm");
        let status: TimelineDotProps["color"] = "success";
        if (el.organizationEventIsOpen && endDate < new Date()) {
          status = "warning";
        } else if (!el.organizationEventIsOpen) {
          status = "grey";
        }
        return (
          <TimelineItem key={el.organizationEventId}>
            <TimelineOppositeContent>
              <EventDate month={month} day={day} time={time} />
            </TimelineOppositeContent>
            <TimelineSeparator>
              <StyledTimelineDot color={status} />
              {index + 1 !== data.length && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <EventContent
                href={
                  formatHref
                    ? formatHref(el.organizationEventId)
                    : `/me/event/events/${el.organizationEventId}`
                }
                title={el.organizationEventTitle}
                status={status}
                orgMembers={el.organizationMemberList}
                address={el.organizationEventAddress}
                index={index}
              />
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default EventTimeLine;
