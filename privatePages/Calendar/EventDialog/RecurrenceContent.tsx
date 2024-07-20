import React, { useEffect, useCallback, FC } from "react";

import { ByWeekday, Frequency, RRule, Weekday } from "rrule";
import useStateRef from "@eGroupAI/hooks/useStateRef";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";

import Card from "@eGroupAI/material/Card";
import CardContent from "@eGroupAI/material/CardContent";
import TextField from "@eGroupAI/material/TextField";
import MenuItem from "@eGroupAI/material/MenuItem";
import RadioGroup from "@eGroupAI/material/RadioGroup";
import FormControlLabel from "@eGroupAI/material/FormControlLabel";
import Radio from "@eGroupAI/material/Radio";
import InputAdornment from "@eGroupAI/material/InputAdornment";
import DatePicker from "@eGroupAI/material-lab/DatePicker";

enum WeekdayMap {
  "SU" = "日",
  "MO" = "一",
  "TU" = "二",
  "WE" = "三",
  "TH" = "四",
  "FR" = "五",
  "SA" = "六",
}
const weekdays: Weekday[] = [
  RRule.SU,
  RRule.MO,
  RRule.TU,
  RRule.WE,
  RRule.TH,
  RRule.FR,
  RRule.SA,
];

const getWeek = (date: Date) => {
  const d: Date = new Date(+date);
  d.setDate(d.getDate() - d.getDay() + 1);
  return Math.ceil(d.getDate() / 7);
};

const useStyles = makeStyles(() => ({
  flexContent: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  radioGroup: {
    gap: 8,
  },
  flexRow: {
    display: "flex",
  },
  textAlignCenter: {
    textAlign: "center",
    lineHeight: "30px",
  },
  textAlignItemsCenter: {
    display: "flex",
    alignItems: "center",
  },
  itemSpace: {
    marginRight: "20px",
  },
  hideElem: {
    display: "none",
  },
  circleButton: {
    width: "30px",
    height: "30px",
    lineHeight: "30px",
    position: "relative",
    borderRadius: "50%",
    textAlign: "center",
    display: "inline-block",
    verticalAlign: "middle",
    border: "none",
    color: "gray",
    cursor: "pointer",
  },
  mt5: {
    marginTop: "10px",
  },
  bgPrimary: {
    backgroundColor: "#1a73e8",
    color: "white",
  },
  h42: {
    height: "42px",
    lineHeight: "42px",
  },
  select: {
    "& .MuiSelect-select": {
      padding: "8px 16px 9px 16px",
    },
  },
  datePicker: {
    padding: "7px 16px 7px 16px",
  },
}));

export interface RecurrenceContentProps {
  defaultValue?: string;
  onChange?: (rrule: string) => void;
}

const RecurrenceContent: FC<RecurrenceContentProps> = (props) => {
  const { defaultValue, onChange } = props;

  const classes = useStyles();
  const [monthRDate, setMonthRDate] = useStateRef(1);
  const [monthRDay, setMonthRDay] = useStateRef(1);
  const [monthRWeekNum, setMonthRWeekNum] = useStateRef(1);
  const [selectedWeekdays, setSelectedWeekdays, selectedWeekdaysRef] =
    useStateRef<Weekday[]>([]);
  const [
    monthlySelectedOption,
    setMonthlySelectedOption,
    monthlySelectedOptionRef,
  ] = useStateRef("1");
  const [endsType, setEndsType, endsTypeRef] = useStateRef("0");
  const [freq, setFreq, freqRef] = useStateRef(Frequency.DAILY);
  const [count, setCount, countRef] = useStateRef(1);
  const [rInterval, setRInterval, rIntervalRef] = useStateRef(1);
  const [until, setUntil, untilRef] = useStateRef<Date>();

  useEffect(() => {
    const date = new Date();
    setUntil(date);
    setMonthRDate(date.getDate());
    setMonthRDay(date.getDay());
    setMonthRWeekNum(getWeek(date));
    // componentDidMount life cycle so doesn't need to assign dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (defaultValue) {
      const { interval, freq, until, count, byweekday } =
        RRule.fromString(defaultValue).origOptions;
      if (interval !== undefined) {
        setRInterval(interval);
      }
      if (freq !== undefined) {
        setFreq(freq);
      }
      if (
        byweekday !== undefined &&
        byweekday !== null &&
        Array.isArray(byweekday)
      ) {
        const isSelectedMonthlyOption =
          byweekday.map((el) => (el as Weekday).n).filter(Boolean).length > 0;
        if (isSelectedMonthlyOption) {
          setMonthlySelectedOption("2");
        } else {
          setSelectedWeekdays(byweekday as Weekday[]);
        }
      }
      if (until !== undefined && until !== null) {
        setUntil(until);
        setEndsType("1");
      }
      if (count !== undefined && count !== null) {
        setCount(count);
        setEndsType("2");
      }
    }
    // Only reset values when defaultValue changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const clickDatePicker = () => {
    setEndsType("1");
  };

  const clickOccurrences = () => {
    setEndsType("2");
  };

  const getByweekday = useCallback(
    (freq: Frequency) => {
      switch (freq) {
        case Frequency.WEEKLY: {
          const tempArr: ByWeekday[] = [];
          weekdays.forEach((el, index) => {
            if (selectedWeekdaysRef.current[index]) tempArr.push(el);
          });
          return tempArr;
        }
        case Frequency.MONTHLY: {
          if (monthlySelectedOptionRef.current === "1") {
            return undefined;
          }
          if (monthlySelectedOptionRef.current === "2") {
            const wd = weekdays[monthRDay];
            return wd ? [wd.nth(monthRWeekNum)] : undefined;
          }
          return undefined;
        }
        default:
          return undefined;
      }
    },
    [monthRDay, monthRWeekNum, monthlySelectedOptionRef, selectedWeekdaysRef]
  );

  const handleChange = useCallback(() => {
    const rrule = new RRule({
      freq: freqRef.current,
      until: Number(endsTypeRef.current) === 1 ? untilRef.current : undefined,
      count: Number(endsTypeRef.current) === 2 ? countRef.current : undefined,
      interval: rIntervalRef.current,
      byweekday: getByweekday(freqRef.current),
    });
    if (onChange) {
      onChange(rrule.toString());
    }
  }, [
    countRef,
    endsTypeRef,
    freqRef,
    getByweekday,
    onChange,
    rIntervalRef,
    untilRef,
  ]);

  return (
    <Card>
      <CardContent>
        <div className={classes.flexContent}>
          <div className={`${classes.flexRow} ${classes.mt5}`}>
            <div
              className={`${classes.textAlignCenter} ${classes.itemSpace} ${classes.textAlignItemsCenter}`}
            >
              每
            </div>
            <div className={classes.itemSpace}>
              <TextField
                type="number"
                size="small"
                onChange={(e) => {
                  setRInterval(Number(e.target.value));
                  handleChange();
                }}
                value={rInterval}
                inputProps={{
                  min: 0,
                }}
              />
            </div>
            <div className={classes.itemSpace}>
              <TextField
                className={classes.select}
                select
                size="small"
                onChange={(e) => {
                  setFreq(e.target.value as unknown as Frequency);
                  handleChange();
                }}
                value={freq}
              >
                <MenuItem value={Frequency.DAILY}>天</MenuItem>
                <MenuItem value={Frequency.WEEKLY}>週</MenuItem>
                <MenuItem value={Frequency.MONTHLY}>個月</MenuItem>
                <MenuItem value={Frequency.YEARLY}>年</MenuItem>
              </TextField>
            </div>
            <div
              className={`${classes.textAlignCenter} ${classes.itemSpace} ${classes.textAlignItemsCenter}`}
            >
              重複
            </div>
          </div>
          <div
            className={`${freq !== Frequency.WEEKLY ? classes.hideElem : ""} ${
              classes.mt5
            }`}
          >
            {weekdays.map((el) => (
              <button
                key={el.toString()}
                onClick={() => {
                  const findIndex = selectedWeekdays.findIndex(
                    (wd) => wd.toString() === el.toString()
                  );
                  const next = [...selectedWeekdays];
                  if (findIndex !== -1) {
                    next.splice(findIndex, 1);
                  } else {
                    next.push(el);
                  }
                  setSelectedWeekdays(next);
                  handleChange();
                }}
                className={clsx(classes.circleButton, {
                  [classes.bgPrimary]:
                    selectedWeekdays.findIndex(
                      (wd) => wd.toString() === el.toString()
                    ) !== -1,
                })}
                type="button"
              >
                {" "}
                {WeekdayMap[el.toString() as keyof typeof WeekdayMap]}{" "}
              </button>
            ))}
          </div>
          <div
            className={`${freq !== Frequency.MONTHLY ? classes.hideElem : ""} ${
              classes.mt5
            }`}
          >
            <TextField
              select
              size="small"
              value={monthlySelectedOption}
              onChange={(e) => {
                setMonthlySelectedOption(e.target.value as string);
                handleChange();
              }}
            >
              <MenuItem value="1"> 每月第 {monthRDate} 天</MenuItem>
            </TextField>
          </div>
          <div className={`${classes.mt5} ${classes.flexRow}`}>
            <div>
              <RadioGroup
                value={endsType}
                onChange={(e) => {
                  setEndsType(e.target.value);
                  handleChange();
                }}
                className={classes.radioGroup}
              >
                <div
                  className={`${classes.textAlignCenter} ${classes.itemSpace} ${classes.textAlignItemsCenter}`}
                >
                  <FormControlLabel
                    value="0"
                    control={<Radio />}
                    label="持續不停"
                  />
                </div>
                <div
                  className={`${classes.textAlignCenter} ${classes.itemSpace} ${classes.textAlignItemsCenter}`}
                >
                  <FormControlLabel
                    value="1"
                    control={<Radio />}
                    label="結束時間"
                  />
                  <div
                    onClick={() => clickDatePicker()}
                    onKeyDown={() => clickDatePicker()}
                    tabIndex={0}
                    role="button"
                  >
                    <DatePicker
                      className={classes.datePicker}
                      onChange={(date) => {
                        if (date) {
                          setMonthRDate(date.getDate());
                          setMonthRDay(date.getDay());
                          setMonthRWeekNum(getWeek(date));
                          setUntil(date);
                          handleChange();
                        }
                      }}
                      value={until}
                      disabled={endsType !== "1"}
                      hiddenLabel
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </div>
                </div>
                <div
                  className={`${classes.textAlignCenter} ${classes.itemSpace} ${classes.textAlignItemsCenter}`}
                >
                  <FormControlLabel
                    value="2"
                    control={<Radio />}
                    label="重複"
                  />
                  <div
                    className={`${classes.h42} ${classes.textAlignItemsCenter}`}
                    onClick={() => clickOccurrences()}
                    onKeyDown={() => clickOccurrences()}
                    tabIndex={0}
                    role="button"
                  >
                    <TextField
                      size="small"
                      disabled={endsType !== "2"}
                      value={count}
                      onChange={(e) => {
                        setCount(Number(e.target.value));
                        handleChange();
                      }}
                      type="number"
                      InputProps={{
                        inputProps: {
                          min: 0,
                        },
                        endAdornment: (
                          <InputAdornment position="end">次</InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="1"> 每月第 {monthRDate} 天</MenuItem>
                    </TextField>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurrenceContent;
