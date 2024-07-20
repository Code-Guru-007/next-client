import React, { FC, useEffect, useState } from "react";

import { addMonths } from "date-fns";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import Button from "@eGroupAI/material/Button";
import { NavigationAction } from "./types";
import Month from "./Month";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("lg")]: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  container: {
    display: "flex",
    flexDirection: "column",
  },
  item: {
    display: "flex",
    position: "relative",
    paddintTop: "5px",
  },
  actionBtnToday: {
    position: "absolute",
    padding: "0px 15px 3px 25px",
    bottom: 0,
    left: 0,
  },
  actionBtnClear: {
    position: "absolute",
    padding: "0px 25px 3px 15px",
    bottom: 0,
    right: 0,
  },
}));

export interface MenuProps {
  date: Date | null;
  minDate: Date;
  maxDate: Date;
  disableYearMonth: boolean;
  onDayClick: (date: Date) => void;
  onClear?: () => void;
}

const Menu: FC<MenuProps> = (props) => {
  const classes = useStyles();
  const { date, minDate, maxDate, disableYearMonth, onDayClick, onClear } =
    props;
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    !date ? new Date() : date
  );
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    !date ? new Date() : date
  );

  useEffect(() => {
    if (date) {
      setSelectedMonth(date);
    }
    setSelectedDate(date);
  }, [date]);

  const handleMonthNavigate = (action: NavigationAction) => {
    setSelectedMonth(addMonths(selectedMonth, action));
  };

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.item}>
          <Month
            minDate={minDate}
            maxDate={maxDate}
            disableYearMonth={disableYearMonth}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            navState={[true, true]}
            setSelectedMonth={setSelectedMonth}
            onDayClick={onDayClick}
            onMonthNavigate={handleMonthNavigate}
          />
          <div className={classes.actionBtnToday}>
            <Button
              color="primary"
              variant="text"
              onClick={() => {
                const today = new Date();
                onDayClick(today);
              }}
            >
              {wordLibrary?.today ?? "今天"}
            </Button>
          </div>
          <div className={classes.actionBtnClear}>
            <Button
              color="primary"
              onClick={() => {
                if (onClear) onClear();
              }}
            >
              {wordLibrary?.clear ?? "清除"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
