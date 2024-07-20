import React, { useEffect } from "react";

import { addMonths, isAfter, isBefore } from "date-fns";
import { Theme } from "@mui/material";
import { WithStyles } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
import Button from "@eGroupAI/material/Button";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

import { Marker, Focused } from "./types";

import Month, { MonthProps } from "./Month";

export const MARKERS: { [key: string]: Marker } = {
  FIRST_MONTH: Symbol("firstMonth"),
  SECOND_MONTH: Symbol("secondMonth"),
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      paddingTop: 5,
      paddingBottom: 20,
      position: "relative",
      [theme.breakpoints.down("lg")]: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      },
    },
    actionBtnToday: {
      position: "absolute",
      padding: "0px 15px 3px 25px",
      bottom: 0,
      left: 0,
    },
    actionBtnClear: {
      position: "absolute",
      padding: "0 25px 0 25px",
      bottom: 0,
      right: 0,
    },
  });
export interface RangeMenuProps extends WithStyles<typeof styles> {
  startDate?: Date;
  endDate?: Date;
  minDate: Date;
  maxDate: Date;
  hoverDay?: Date;
  focused?: Focused;
  onDayClick: (date?: Date) => void;
  onDayHover: (date: Date) => void;
}

const RangeMenu: React.FC<RangeMenuProps> = (props) => {
  const {
    classes,
    startDate,
    endDate,
    hoverDay,
    minDate,
    maxDate,
    onDayClick,
    onDayHover,
    focused,
  } = props;

  const [firstMonth, setFirstMonth] = React.useState<Date>(
    startDate || new Date()
  );
  const [secondMonth, setSecondMonth] = React.useState<Date>(
    endDate || new Date()
  );

  useEffect(() => {
    if (startDate) {
      setFirstMonth(startDate);
      if (!endDate || isAfter(startDate, endDate)) setSecondMonth(startDate);
    }
    if (endDate) {
      setSecondMonth(endDate);
      if (!startDate || isBefore(endDate, startDate)) setFirstMonth(endDate);
    }
  }, [startDate, endDate]);

  const setMonthValidated = (date: Date) => {
    if (focused === "start") {
      setFirstMonth(date);
    }
    if (focused === "end") {
      setSecondMonth(date);
    }
  };

  const handleMonthNavigate: MonthProps["onMonthNavigate"] = (
    action,
    marker
  ) => {
    if (marker === MARKERS.FIRST_MONTH) {
      const firstNew = addMonths(firstMonth, action);
      setFirstMonth(firstNew);
    } else {
      const secondNew = addMonths(secondMonth, action);
      setSecondMonth(secondNew);
    }
  };

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <div className={classes.root}>
      <Month
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        maxDate={maxDate}
        hoverDay={hoverDay}
        value={focused === "start" ? firstMonth : secondMonth}
        focused={focused}
        marker={
          focused === "start" ? MARKERS.FIRST_MONTH : MARKERS.SECOND_MONTH
        }
        navState={[true, true]}
        setValue={setMonthValidated}
        onDayClick={onDayClick}
        onDayHover={onDayHover}
        onMonthNavigate={handleMonthNavigate}
      />
      <div className={classes.actionBtnToday}>
        <Button
          color="primary"
          onClick={() => {
            const today = new Date();
            onDayClick(today);
          }}
        >
          {wordLibrary?.today ?? "今天"}
        </Button>
      </div>
      <div className={classes.actionBtnClear}>
        <Button color="primary" onClick={() => onDayClick(undefined)}>
          {wordLibrary?.clear ?? "清除"}
        </Button>
      </div>
    </div>
  );
};

export default withStyles(styles, {
  name: "MuiEgRangeMenu",
})(RangeMenu);
