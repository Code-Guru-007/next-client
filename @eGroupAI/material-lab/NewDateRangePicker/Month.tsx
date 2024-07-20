import React from "react";
import { Grid, Typography, Theme } from "@mui/material";
import { WithStyles } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
import { getDate, isSameMonth, isToday, format } from "date-fns";
import {
  chunks,
  getDaysInMonth,
  inDateRange,
  isSameDayValid,
  isWithinIntervalValid,
  isBeforeValid,
  isAfterValid,
} from "./utils";
import Header from "./Header";
import Day from "./Day";
import { NavigationAction, Focused } from "./types";

const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"];

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "inline-flex",
      width: 318,
    },
    weekDaysContainer: {
      marginTop: 10,
      paddingLeft: 30,
      paddingRight: 30,
    },
    monthContainer: {
      paddingLeft: 15,
      paddingRight: 15,
      marginTop: 15,
      marginBottom: 20,
    },
    weekContainer: {
      margin: "2px 0",
    },
    weekText: {
      fontWeight: 700,
      fontFamily: theme.typography.fontFamily,
      fontSize: 15,
      color: theme.palette.text.secondary,
    },
  });
export interface MonthProps extends WithStyles<typeof styles> {
  startDate?: Date;
  endDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  hoverDay?: Date;
  value: Date;
  focused?: Focused;
  marker?: symbol;
  navState: [boolean, boolean];
  setValue: (date: Date) => void;
  onDayClick?: (date: Date) => void;
  onDayHover?: (date: Date) => void;
  onMonthNavigate?: (action: NavigationAction, marker?: symbol) => void;
}

const Month: React.FC<MonthProps> = (props) => {
  const {
    classes,
    value: date,
    marker,
    setValue: setDate,
    focused,
    hoverDay,
    startDate,
    endDate,
    onDayClick,
    onDayHover,
    onMonthNavigate,
    navState,
  } = props;

  const inHoverRange = (day: Date) => {
    if (!hoverDay) return false;
    if (focused === "start") {
      if (!startDate && endDate) {
        return isWithinIntervalValid(day, hoverDay, endDate);
      }
      if (startDate && endDate) {
        return isWithinIntervalValid(day, hoverDay, startDate);
      }
    } else if (focused === "end") {
      if (startDate && !endDate) {
        return isWithinIntervalValid(day, startDate, hoverDay);
      }
      if (startDate && endDate) {
        return isWithinIntervalValid(day, endDate, hoverDay);
      }
    }
    return false;
  };

  const [back, forward] = navState;
  return (
    <div className={classes.root}>
      <Grid container>
        <Header
          date={date}
          setDate={setDate}
          nextDisabled={!forward}
          prevDisabled={!back}
          onClickPrevious={() => {
            if (onMonthNavigate) {
              onMonthNavigate(NavigationAction.Previous, marker);
            }
          }}
          onClickNext={() => {
            if (onMonthNavigate) {
              onMonthNavigate(NavigationAction.Next, marker);
            }
          }}
        />

        <Grid
          item
          container
          justifyContent="space-between"
          className={classes.weekDaysContainer}
        >
          {WEEK_DAYS.map((day) => (
            <Typography variant="body2" key={day} className={classes.weekText}>
              {day}
            </Typography>
          ))}
        </Grid>

        <Grid
          item
          container
          direction="column"
          className={classes.monthContainer}
        >
          {chunks(getDaysInMonth(date), 7).map((week) => (
            <Grid
              key={week[0]?.getTime()}
              container
              justifyContent="center"
              className={classes.weekContainer}
            >
              {week.map((day) => {
                const isStart = isSameDayValid(day, startDate);
                const isEnd = isSameDayValid(day, endDate);
                const isRangeOneDay = isSameDayValid(startDate, endDate);
                // const disable =
                //   !isWithinIntervalValid(day, minDate, maxDate) ||
                //   (focused === "end" && isBeforeValid(day, startDate)) ||
                //   (focused === "start" && isAfterValid(day, endDate));
                const isHovered = isSameDayValid(day, hoverDay);
                const startOfHoveredRange =
                  isHovered &&
                  (isBeforeValid(hoverDay, startDate) ||
                    isBeforeValid(hoverDay, endDate));
                const endOfHoveredRange =
                  isHovered &&
                  (isAfterValid(hoverDay, startDate) ||
                    isAfterValid(hoverDay, endDate));
                return (
                  <Day
                    key={format(day, "MM-dd-yyyy")}
                    filled={isStart || isEnd}
                    outlined={isToday(day)}
                    isInDateRange={
                      inDateRange(day, startDate, endDate) && !isRangeOneDay
                    }
                    isInHoveredRange={inHoverRange(day)}
                    startOfHoveredRange={startOfHoveredRange}
                    endOfHoveredRange={endOfHoveredRange}
                    startDateData={startDate}
                    endDateData={endDate}
                    invisible={!isSameMonth(date, day)}
                    startOfDateRange={isStart && !isRangeOneDay}
                    endOfDateRange={isEnd && !isRangeOneDay}
                    onClick={() => {
                      if (onDayClick) {
                        onDayClick(day);
                      }
                    }}
                    onHover={() => {
                      if (onDayHover) {
                        onDayHover(day);
                      }
                    }}
                    value={getDate(day)}
                  />
                );
              })}
            </Grid>
          ))}
        </Grid>
      </Grid>
    </div>
  );
};

export default withStyles(styles, {
  name: "MuiEgMonth",
})(Month);
