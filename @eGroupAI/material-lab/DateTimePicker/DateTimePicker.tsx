import React, { FC, useMemo, useState } from "react";
import clsx from "clsx";
import makeStyles from "@mui/styles/makeStyles";
import { format, toDate } from "@eGroupAI/utils/dateUtils";
import DatePicker, { DatePickerProps } from "../DatePicker";
import { combineDateTime } from "../NewDateRangePicker/utils";
import TimePicker, { Time } from "../TimePicker";

const useStyles = makeStyles(
  (theme) => ({
    root: {
      display: "inline-flex",
      width: (props: DateTimePickerProps) =>
        props.fullWidth ? "100%" : undefined,
    },
    timePicker: {
      marginLeft: theme.spacing(),
    },
  }),
  {
    name: "MuiDateTimePicker",
  }
);

export type HandleChangeArgs = {
  nextDate?: Date | null;
  nextTime?: Time | null;
};

export interface DateTimePickerProps extends Omit<DatePickerProps, "onChange"> {
  onChange?: (dateTime: Date | null) => void;
}

const DateTimePicker: FC<DateTimePickerProps> = (props) => {
  const classes = useStyles(props);
  const {
    className,
    onChange,
    value,
    defaultValue = null,
    variant,
    size,
    style,
    ...other
  } = props;
  const [date, setDate] = useState(defaultValue);

  const time: Time = useMemo(() => format(date, "HH:mm") || "00:00", [date]);

  const handleChange = ({ nextDate, nextTime }: HandleChangeArgs) => {
    if (onChange) {
      const dateTime = combineDateTime(nextDate || date, nextTime || time);
      if (dateTime !== undefined) {
        const next = dateTime ? toDate(dateTime) : undefined;
        if (next !== undefined) {
          setDate(next);
          onChange(next);
        }
      }
    }
  };

  return (
    <div className={clsx(className, classes.root)} style={style}>
      <DatePicker
        onChange={(date) => {
          handleChange({
            nextDate: date,
          });
        }}
        value={date}
        variant={variant}
        size={size}
        {...other}
      />
      <TimePicker
        className={classes.timePicker}
        onChange={(time) => {
          handleChange({
            nextTime: time,
          });
        }}
      />
    </div>
  );
};

export default DateTimePicker;
