/* eslint-disable no-nested-ternary */
import React, {
  FC,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import makeStyles from "@mui/styles/makeStyles";
import { format } from "@eGroupAI/utils/dateUtils";
import { isSameDay, addYears, isAfter, isBefore, isValid } from "date-fns";
import {
  TextFieldProps,
  Typography,
  Theme,
  ClickAwayListener,
  Popper,
  Paper,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { egPalette } from "@eGroupAI/material/stylesheet/themeOptions";
import { DateInputMask } from "@eGroupAI/material-lab/DatePicker";
import { MaskedTimeInputPicker } from "@eGroupAI/material-lab/TimePicker";
import Grid from "@eGroupAI/material/Grid";
import clsx from "clsx";
import { getValidDate } from "./utils";
import { Focused, Touched, DateRange } from "./types";
import RangeMenu from "./RangeMenu";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    "& .MuiInputBase-input": {
      minWidth: 90,
      padding: "0px 2px",
      textAlign: "center",
    },
  },
  borderBlue: {
    border: `1px solid ${egPalette?.primary[0]}`,
  },
  borderGrey: {
    border: "1px solid #f5f5f5",
  },
  paper: {
    display: "flex",
    [theme.breakpoints.down("lg")]: {
      width: "100%",
      minHeight: "100vh",
    },
  },
  close: {
    position: "absolute",
    right: 5,
    top: 5,
  },
  daterange: {
    display: "flex",
    justifyContent: "space-between",
    // background: egPalette.text[5],
    maxWidth: ({ showTime, fullWidth }: NewDateRangePickerProps) =>
      `${fullWidth ? "unset" : showTime ? "100%" : "320px"}`,
    width: ({ fullWidth }: NewDateRangePickerProps) =>
      `${fullWidth ? "100%" : "auto"}`,
    borderRadius: 8,
    padding: "12.2px 10px",
  },
  datetimetext: {
    display: "flex",
    maxWidth: "100%",
    justifyContent: "center",
    // background: egPalette.text[5],
    alignItems: "center",
  },
  gapDateAndTime: {
    width: 30,
  },
  textColor: {
    color: theme.palette.text.primary,
  },
  darkColor: {
    color: theme.palette.text.secondary,
  },
  input: {
    width: ({ showTime }: NewDateRangePickerProps) =>
      `${showTime ? "114px" : "120px"}`,
    textAlign: "center",
    padding: "2px 2px 3px",
    fontSize: "15px",
    lineHeight: "22.5px",
    fontWeight: 400,
  },
  popover: {
    "& .MuiPopover-paper": {
      overflowY: "hidden",
    },
  },
  popper: {
    border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
    "&": { zIndex: theme.zIndex.modal + 100, margin: "10px 0px !important" },
    "& .MuiPaper-root": {
      overflowY: "hidden",
    },
  },
}));

type FilterOptionsItem = {
  label: string;
  value: string;
};

type FilterOptionsValue = {
  [name: string]:
    | number[]
    | (number | null)[]
    | (Date | null)[]
    | string[]
    | FilterOptionsItem[];
};

export interface NewDateRangePickerProps
  extends Omit<TextFieldProps, "onChange"> {
  defaultStartDate?: Date;
  withTime?: boolean;
  defaultStartTime?: string;
  defaultEndDate?: Date;
  defaultEndTime?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  startDate?: Date | string;
  startTime?: string;
  endDate?: Date | string;
  endTime?: string;
  onChange?: (dateRange: DateRange, focused?: Focused) => void;
  onDayClick?: (date?: Date) => void;
  onCloseClick?: () => void;
  showTime?: boolean;
  startDateProps?: TextFieldProps;
  endDateProps?: TextFieldProps;
  onStartDateChanege?: (date: Date) => void;
  onEndDateChange?: (date: Date) => void;
  isClearDateTime?: boolean;
  onClearDatePicker?: React.Dispatch<React.SetStateAction<boolean>>;
  enableOnBlurChange?: boolean;
  setFilterOptionsTempValue?: React.Dispatch<
    React.SetStateAction<FilterOptionsValue>
  >;
}

/**
 * DateRange picker behavior is inspire by ant design.
 * https://ant.design/components/date-picker/
 */
const NewDateRangePicker: FC<NewDateRangePickerProps> = (props) => {
  const classes = useStyles(props);
  const {
    defaultStartDate,
    defaultStartTime,
    defaultEndDate,
    defaultEndTime,
    startDate: startDateProp,
    startTime: startTimeProp,
    endDate: endDateProp,
    endTime: endTimeProp,
    minDate: minDateProp,
    maxDate: maxDateProp,
    onChange,
    onDayClick: onDayClickProp,
    onCloseClick,
    showTime,
    label,
    onStartDateChanege,
    onEndDateChange,
    isClearDateTime: isClearDateTimeProp,
    onClearDatePicker,
    enableOnBlurChange = false,
  } = props;

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [startTime, setStartTime] = useState(defaultStartTime || "00:00");
  const startDateString = useMemo(
    () => format(startDate, "yyyy-MM-dd"),
    [startDate]
  );
  const [startInputValue, setStartInputValue] = useState(startDateString);

  const [endDate, setEndDate] = useState(defaultEndDate);
  const [endTime, setEndTime] = useState(defaultEndTime || "23:59");
  const endDateString = useMemo(() => format(endDate, "yyyy-MM-dd"), [endDate]);
  const [endInputValue, setEndInputValue] = useState(endDateString);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const startEl = useRef<HTMLInputElement>(null);
  const endEl = useRef<HTMLInputElement>(null);

  const [openCalendar, setOpenCalendar] = useState<boolean>(false);
  const [openSTime, setOpenSTime] = useState<"date" | "time" | undefined>(
    undefined
  );
  const [openETime, setOpenETime] = useState<"date" | "time" | undefined>(
    undefined
  );

  const [showBorder, setShowBorder] = useState(false);

  const [hoverDay, setHoverDay] = useState<Date>();
  const [focused, setFocused] = useState<Focused>();
  const [, setTouched] = useState<Touched>({
    start: false,
    end: false,
  });
  const minDate = getValidDate(minDateProp, addYears(new Date(), -10));
  const maxDate = getValidDate(maxDateProp, addYears(new Date(), 10));

  const getValidDateTime = (date?: Date, time = "00:00") => {
    if (!date) return undefined;
    return getValidDate(`${format(date, "yyyy-MM-dd")}T${time}`, new Date());
  };

  useEffect(() => {
    if (startDateProp) {
      setStartDate((d) => {
        if (d?.toISOString() !== new Date(startDateProp).toISOString()) {
          return new Date(startDateProp);
        }
        return d;
      });
    }
  }, [startDateProp]);

  useEffect(() => {
    if (startTimeProp) {
      setStartTime(startTimeProp);
    }
  }, [startTimeProp]);

  useEffect(() => {
    if (endDateProp) {
      setEndDate((d) => {
        if (d?.toISOString() !== new Date(endDateProp).toISOString()) {
          return new Date(endDateProp);
        }
        return d;
      });
    }
  }, [endDateProp]);

  useEffect(() => {
    if (endTimeProp) {
      setEndTime(endTimeProp);
    }
  }, [endTimeProp]);

  useEffect(() => {
    setStartInputValue(startDateString);
  }, [startDateString]);

  useEffect(() => {
    setEndInputValue(endDateString);
  }, [endDateString]);

  useEffect(() => {
    if (onChange) {
      onChange(
        [
          getValidDateTime(startDate, startTime),
          getValidDateTime(endDate, endTime),
        ],
        focused
      );
    }
    if (onStartDateChanege) {
      onStartDateChanege(startDate as Date);
    }
    if (onEndDateChange) {
      onEndDateChange(endDate as Date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate, endTime, focused, startDate, startTime]);

  useEffect(() => {
    if (isClearDateTimeProp) {
      setStartDate(undefined);
      setStartTime("00:00");
      setEndDate(undefined);
      setEndTime("23:59");
      if (onClearDatePicker) onClearDatePicker(false);
    }
  }, [isClearDateTimeProp, onClearDatePicker]);

  const handlePopupOpen = () => {
    setOpenCalendar(true);
  };

  const handlePopupClose = () => {
    if (onCloseClick) {
      onCloseClick();
    }
    setOpenCalendar(false);
    setTouched({
      start: false,
      end: false,
    });
  };

  const focusStartDate = () => {
    setFocused("start");
    const { current } = startEl;
    if (current) {
      setAnchorEl(current);
      current.focus();
    }
  };

  const focusEndDate = () => {
    setFocused("end");
    const { current } = endEl;
    if (current) {
      setAnchorEl(current);
      current.focus();
    }
  };

  const handleStartDateClick = () => {
    focusStartDate();
    handlePopupOpen();
  };

  const handleEndDateClick = () => {
    focusEndDate();
    handlePopupOpen();
  };

  const getDateRangeWhenSetStartDate = (day?: Date): DateRange => {
    const nextStartDate = day;
    let nextEndDate = endDate;
    if (day && endDate && isAfter(day, endDate) && endDate) {
      nextEndDate = day;
    }
    return [nextStartDate, nextEndDate];
  };

  const getDateRangeWhenSetEndDate = (day?: Date): DateRange => {
    let nextStartDate = startDate;
    const nextEndDate = day;
    if (day && startDate && isBefore(day, startDate) && startDate) {
      nextStartDate = day;
    }
    return [nextStartDate, nextEndDate];
  };

  // This behavior refer from ant design range picker.
  const handleSetDateNextAction = (startDate?: Date, endDate?: Date) => {
    if (focused === "start") {
      setTouched((val) => ({
        ...val,
        start: true,
      }));
      if (!endDate || startDate === endDate) {
        focusEndDate();
      } else {
        handlePopupClose();
      }
    }
    if (focused === "end") {
      setTouched((val) => ({
        ...val,
        end: true,
      }));
      if (!startDate || startDate === endDate) {
        focusStartDate();
      } else {
        handlePopupClose();
      }
    }
  };

  const handleRangeMenuDayClick = (day?: Date) => {
    if (onDayClickProp) {
      onDayClickProp(day);
    }
    if (focused === "start") {
      const dateRange = getDateRangeWhenSetStartDate(day);
      setStartDate(dateRange[0]);
      setEndDate(dateRange[1]);
      handleSetDateNextAction(dateRange[0], dateRange[1]);
    }
    if (focused === "end") {
      const dateRange = getDateRangeWhenSetEndDate(day);
      setStartDate(dateRange[0]);
      setEndDate(dateRange[1]);
      handleSetDateNextAction(dateRange[0], dateRange[1]);
    }
  };

  const handleDayHover = (date: Date) => {
    if (!hoverDay || !isSameDay(date, hoverDay)) {
      setHoverDay(date);
    }
  };

  const handleOnStartDateInputChange = (startInputValue: string) => {
    setStartInputValue(startInputValue);
    if (new Date(startInputValue) > maxDate) {
      setStartInputValue(format(maxDate, "yyyy-MM-dd"));
    }
    if (new Date(startInputValue) < minDate) {
      setStartInputValue(format(minDate, "yyyy-MM-dd"));
    }

    const inputDate = new Date(startInputValue);
    if (isValid(inputDate) && minDate < inputDate && inputDate < maxDate) {
      setStartDate(inputDate);
      if (onStartDateChanege) onStartDateChanege(inputDate);
      const dateRange = getDateRangeWhenSetStartDate(inputDate);
      setStartDate(dateRange[0]);
      setEndDate(dateRange[1]);
      handleSetDateNextAction(dateRange[0], dateRange[1]);
    }
  };

  const handleOnEndDateInputChange = (endInputValue: string) => {
    setEndInputValue(endInputValue);
    if (new Date(endInputValue) > maxDate) {
      setEndInputValue(format(maxDate, "yyyy-MM-dd"));
    }
    if (new Date(endInputValue) < minDate) {
      setEndInputValue(format(minDate, "yyyy-MM-dd"));
    }

    const inputDate = new Date(endInputValue);
    if (isValid(inputDate) && minDate < inputDate && inputDate < maxDate) {
      setEndDate(inputDate);
      if (onEndDateChange) onEndDateChange(inputDate);
      const dateRange = getDateRangeWhenSetEndDate(inputDate);
      setStartDate(dateRange[0]);
      setEndDate(dateRange[1]);
      handleSetDateNextAction(dateRange[0], dateRange[1]);
    }
  };

  const handleStartTimeChange = useCallback((time: string) => {
    setStartTime(time);
  }, []);

  const handleEndTimeChange = useCallback((time: string) => {
    setEndTime(time);
  }, []);

  const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: 15,
    fontWeight: 400,
    color: theme.palette.grey[500],
    padding: "11px 50px",
  }));

  return (
    <>
      {label && <StyledTypography>{label}</StyledTypography>}
      <div
        className={clsx(
          classes.daterange,
          classes.root,
          openCalendar || showBorder ? classes.borderBlue : classes.borderGrey
        )}
      >
        <Grid container>
          <Grid item xs={5}>
            <div
              className={classes.datetimetext}
              style={{ padding: "5px 0 3px 0 " }}
            >
              <DateInputMask
                ref={startEl}
                value={startInputValue}
                onClick={handleStartDateClick}
                onChange={handleOnStartDateInputChange}
              />
              {showTime ? (
                <div style={{ padding: "0px 5px" }}>
                  <MaskedTimeInputPicker
                    onChange={handleStartTimeChange}
                    setShowBorder={setShowBorder}
                    defaultValue={startTime}
                    activePanel={
                      focused === "start"
                        ? openCalendar
                          ? "date"
                          : openSTime
                          ? "time"
                          : undefined
                        : undefined
                    }
                    setActivePanel={setOpenSTime}
                    rangeFocused="start"
                    setFocused={setFocused}
                    setOpenCalendar={setOpenCalendar}
                    isClearTime={isClearDateTimeProp}
                    onClearTime={onClearDatePicker}
                    enableOnBlurChange={enableOnBlurChange}
                  />
                </div>
              ) : null}
            </div>
          </Grid>
          <Grid item xs={2}>
            <div
              className={`${classes.datetimetext}`}
              style={{ padding: "3px 0 3px 0 " }}
            >
              ~
            </div>
          </Grid>
          <Grid item xs={5}>
            <div
              className={classes.datetimetext}
              style={{ padding: "5px 0 3px 0 " }}
            >
              <DateInputMask
                ref={endEl}
                value={endInputValue}
                onClick={handleEndDateClick}
                onChange={handleOnEndDateInputChange}
              />
              {showTime ? (
                <div style={{ padding: "0px 5px", position: "relative" }}>
                  <MaskedTimeInputPicker
                    onChange={handleEndTimeChange}
                    setShowBorder={setShowBorder}
                    defaultValue={endTime}
                    activePanel={
                      focused === "end"
                        ? openCalendar
                          ? "date"
                          : openETime
                          ? "time"
                          : undefined
                        : undefined
                    }
                    setActivePanel={setOpenETime}
                    rangeFocused="end"
                    setFocused={setFocused}
                    setOpenCalendar={setOpenCalendar}
                    isClearTime={isClearDateTimeProp}
                    onClearTime={onClearDatePicker}
                    enableOnBlurChange={enableOnBlurChange}
                  />
                </div>
              ) : null}
            </div>
          </Grid>
        </Grid>
        <ClickAwayListener onClickAway={handlePopupClose}>
          <Popper
            placement="bottom-start"
            anchorEl={anchorEl}
            open={openCalendar}
            className={classes.popper}
          >
            <Paper>
              <RangeMenu
                startDate={startDate}
                endDate={endDate}
                minDate={minDate}
                maxDate={maxDate}
                hoverDay={hoverDay}
                focused={focused}
                onDayClick={handleRangeMenuDayClick}
                onDayHover={handleDayHover}
              />
            </Paper>
          </Popper>
        </ClickAwayListener>
      </div>
    </>
  );
};
export default NewDateRangePicker;
