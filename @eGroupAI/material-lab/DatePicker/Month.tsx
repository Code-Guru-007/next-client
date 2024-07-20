import React from "react";
import { Grid, Typography, alpha, Box } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { getDate, isSameMonth, format } from "date-fns";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import {
  chunks,
  getDaysInMonth,
  isSameDayValid,
  isWithinIntervalValid,
} from "./utils";
import Header from "./Header";
import Day from "./Day";
import { NavigationAction } from "./types";

const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"];

const useStyles = makeStyles((theme) => ({
  root: {
    display: "inline-flex",
    width: 318,
  },
  weekDaysContainer: {
    marginTop: 10,
    paddingLeft: 30,
    paddingRight: 30,
    color: alpha(theme.palette.common.black, 0.6),
  },
  monthContainer: {
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 35,
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
}));

export interface MonthProps {
  minDate: Date;
  maxDate: Date;
  selectedDate: Date | null;
  selectedMonth: Date;
  marker?: symbol;
  navState: [boolean, boolean];
  disableYearMonth: boolean;
  setSelectedMonth: (date: Date) => void;
  onDayClick?: (date: Date) => void;
  onMonthNavigate?: (action: NavigationAction, marker?: symbol) => void;
}

const Month: React.FC<MonthProps> = (props) => {
  const classes = useStyles();
  const {
    selectedDate,
    selectedMonth,
    marker,
    setSelectedMonth,
    minDate,
    maxDate,
    disableYearMonth,
    onDayClick,
    onMonthNavigate,
    navState,
    ...others
  } = props;
  const [back, forward] = navState;

  return (
    <Box className={classes.root} {...others}>
      <Grid container>
        <Header
          date={selectedMonth}
          setDate={setSelectedMonth}
          minDate={minDate}
          maxDate={maxDate}
          disableYearMonth={disableYearMonth}
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
            <Typography variant="body2" className={classes.weekText} key={day}>
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
          {chunks(getDaysInMonth(selectedMonth), 7).map((week) => (
            <Grid
              key={week[0]?.getTime()}
              container
              justifyContent="center"
              className={classes.weekContainer}
            >
              {week.map((day) => {
                const filled = isSameDayValid(day, selectedDate);
                const disable = !isWithinIntervalValid(day, minDate, maxDate);
                return (
                  <Day
                    key={format(day, "MM-dd-yyyy")}
                    filled={filled}
                    disabled={disable}
                    invisible={!isSameMonth(selectedMonth, day)}
                    onClick={() => {
                      try {
                        if (onDayClick) {
                          onDayClick(day);
                        }
                      } catch (error) {
                        apis.tools.createLog({
                          function:
                            "DatePicker: Month onDayClick to Day onClick",
                          browserDescription: window.navigator.userAgent,
                          jsonData: {
                            data: error,
                            deviceInfo: getDeviceInfo(),
                          },
                          level: "ERROR",
                        });
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
    </Box>
  );
};

export default Month;
