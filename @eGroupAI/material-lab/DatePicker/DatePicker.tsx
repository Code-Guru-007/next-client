import React, { FC, useState, useEffect } from "react";

import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import { format, toDate } from "@eGroupAI/utils/dateUtils";
import { addYears, isValid } from "date-fns";
import { TextFieldProps, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { TypographyProps } from "@eGroupAI/material/Typography";

import { egPalette, palette } from "@eGroupAI/material/stylesheet/themeOptions";
import { combineDateTime } from "../NewDateRangePicker/utils";
import { Time } from "../TimePicker";
import MaskedDateInputPicker from "./MaskedDateInputPicker";
import MaskedTimeInputPicker from "../TimePicker/MaskedTimeInputPicker";
/**
 * Picker behavior is inspire by ant design.
 * https://ant.design/components/date-picker/
 */

interface LabelProps extends TypographyProps {
  fixedLabel?: boolean;
  labelColor?: string;
  error?: boolean;
  required?: boolean;
  labelPadding?: "small" | "medium" | "large" | "none";
}

export interface DatePickerProps extends Omit<TextFieldProps, "onChange"> {
  value?: Date | null;
  defaultValue?: Date | null;
  minDate?: Date | string;
  maxDate?: Date | string;
  /**
   * Enables Actions
   */
  enableAction?: boolean;
  isTime?: boolean;
  disableYearMonth?: boolean;
  onChange?: (date: Date | null) => void | Promise<void | string>;
  onDayClick?: (date: Date | null) => void;
  onCloseClick?: () => void;
  onSave?: () => void;
  /**
   * label position
   * @default false
   */
  fixedLabel?: boolean;
  labelPadding?: "small" | "medium" | "large" | "none";
  /**
   * color of label text
   */
  labelColor?: string;
  placeholder?: string;
  /**
   * Date Picker TextField Border
   * @default false
   */
  showBorder?: boolean;
}

export type HandleChangeArgs = {
  nextDate?: Date | null;
  nextTime?: Time;
};

const useStyles = makeStyles(
  (theme) => ({
    root: {
      display: "flex",
      position: "relative",
      width: ({ isTime, fullWidth }: DatePickerProps) => {
        if (fullWidth) {
          return "100%";
        }
        return isTime ? 282 : 182;
      },
      "& .MuiTextField-root": {
        minWidth: 95,
        width: ({ isTime, fullWidth }: DatePickerProps) => {
          if (fullWidth && isTime) {
            return "calc(100% - 120px)";
          }
          return isTime ? 100 : 100;
        },
      },
      "& .MuiInputBase-input": {
        height: 22.5,
        borderRadius: "3px",
      },
      padding: "12.5px 30px",
    },
    borderGrey: {
      border: `1px solid ${palette.lightGrey.lightGrey}`,
    },
    borderBlue: {
      border: `1px solid ${egPalette?.primary[0]}`,
    },
    border: {
      border: ({ showBorder }: DatePickerProps) =>
        showBorder ? `1px solid ${theme.palette.grey[300]}` : `none`,
    },
    borderError: {
      border: `1px solid ${egPalette?.error[2]}`,
    },
    timePicker: {
      marginLeft: theme.spacing(),
    },
    popover: {
      "& .MuiPopover-paper": {
        overflowY: "hidden",
      },
    },
    simpleDatePicker: {
      justifyContent: "space-around",
    },
    loader: {
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    actionDatePicker: {
      justifyContent: "space-around",
      border: "1px solid #637381",
      "& .MuiTypography-root": {
        background: "none",
      },
      "& .MuiInputBase-input": {
        minWidth: "52px",
      },
    },
    sideBorderGrey: {
      color: palette.text.secondary,
    },
    actionDatePickerActive: {
      justifyContent: "space-around",
      width: "fit-content",
      padding: "12px 30px",
      minWidth: "80px",
      "& .MuiInputBase-input": {
        minWidth: "80px",
      },
    },
  }),
  {
    name: "MuiDatePicker",
  }
);

const StyledTypographyLabel: FC<LabelProps> = ({
  fixedLabel,
  labelColor,
  labelPadding,
  error,
  required,
  ...others
}) => <Typography {...others} />;

const Label: FC<LabelProps> = styled(StyledTypographyLabel)(
  ({
    theme,
    fixedLabel,
    labelColor,
    error,
    required,
    labelPadding = "none",
  }) => {
    let padding = "6px 38px";
    let paddingFixedLabel = "0px 6px";
    switch (labelPadding) {
      case "small":
        padding = "6px 12px";
        paddingFixedLabel = "0px 2px";
        break;
      case "medium":
        padding = "6px 24px";
        paddingFixedLabel = "0px 4px";
        break;
      case "none":
        padding = "6px 0px";
        paddingFixedLabel = "0px 0px";
        break;
      default:
        break;
    }
    return {
      fontWeight: 400,
      color:
        !!error && required
          ? theme.palette.error.main
          : labelColor || theme.palette.grey[500],
      padding: `${fixedLabel ? paddingFixedLabel : padding}`,
      marginLeft: 0,
      lineHeight: `${fixedLabel ? "54px" : "unset"} `,
    };
  }
);

const DatePicker: FC<DatePickerProps> = (props) => {
  const classes = useStyles(props);
  const {
    className,
    label,
    isTime,
    value = null,
    defaultValue = null,
    minDate: minDateProp,
    maxDate: maxDateProp,
    disableYearMonth = false,
    onChange,
    onSave,
    onDayClick: onDayClickProp,
    onCloseClick,
    enableAction,
    hiddenLabel,
    fixedLabel,
    labelColor,
    labelPadding = "none",
    error,
    required,
    name,
  } = props;

  const [ShowBorder, setShowBorder] = useState(false);
  const [date, setDate] = useState(
    isValid(value || defaultValue) ? value || defaultValue : null
  );
  const [timeValue, setTimeValue] = useState(
    isValid(value || defaultValue)
      ? format(value, "HH:mm") || format(defaultValue, "HH:mm")
      : "00:00"
  );

  useEffect(() => {
    setDate(isValid(value || defaultValue) ? value || defaultValue : null);
    setTimeValue(
      isValid(value || defaultValue)
        ? format(value, "HH:mm") || format(defaultValue, "HH:mm")
        : "00:00"
    );
  }, [value, defaultValue]);
  const [activePanel, setActivePanel] = useState<"date" | "time" | undefined>(
    undefined
  );

  const minDate =
    minDateProp || toDate(minDateProp, addYears(new Date(), -1000));
  const maxDate =
    maxDateProp || toDate(maxDateProp, addYears(new Date(), 1000));

  const handleSetDateTime = ({ nextDate, nextTime }: HandleChangeArgs) => {
    try {
      const dateTimeString = combineDateTime(
        nextDate || date,
        nextTime || timeValue
      );
      let nextDateTime = dateTimeString ? new Date(dateTimeString) : null;
      if (nextDate === null) nextDateTime = null;
      setDate(nextDateTime);
      setTimeValue(format(nextDateTime, "HH:mm"));
      if (onChange) onChange(nextDateTime);
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleSetDateTime",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handlePopupClose = () => {
    if (onCloseClick) {
      onCloseClick();
    }
  };

  const handleMenuDayClick = (day: Date | null) => {
    try {
      if (onDayClickProp) {
        onDayClickProp(day);
      }
      handleSetDateTime({
        nextDate: day,
        nextTime: timeValue,
      });
      handlePopupClose();
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleMenuDayClick",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleTimeChange = (nTime: Time) => {
    setTimeValue(nTime);
    handleSetDateTime({
      nextDate: date,
      nextTime: nTime,
    });
  };

  return (
    <Box display="flex" flexDirection={`${fixedLabel ? "row" : "column"}`}>
      {!hiddenLabel && (
        <Label
          fixedLabel={fixedLabel}
          labelColor={labelColor}
          labelPadding={labelPadding}
          error={error}
          required={required}
          variant="subtitle2"
        >
          {label}
          {required && "*"}
        </Label>
      )}
      <div
        className={clsx(className, classes.root, classes.borderGrey, {
          [classes.borderBlue]: ShowBorder && !enableAction,
          [classes.borderError]: !!error && required,
          [classes.actionDatePicker]: enableAction,
          [classes.actionDatePickerActive]: enableAction && activePanel,
          [classes.simpleDatePicker]: !(enableAction && activePanel),
        })}
      >
        <MaskedDateInputPicker
          name={name}
          required={required}
          defaultDate={date}
          minDate={new Date(minDate)}
          maxDate={new Date(maxDate)}
          disableYearMonth={disableYearMonth}
          onSetDate={handleMenuDayClick}
          onSave={onSave}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />
        {isTime && (
          <MaskedTimeInputPicker
            className={classes.timePicker}
            onChange={handleTimeChange}
            onSave={onSave}
            setShowBorder={setShowBorder}
            defaultValue={timeValue}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
          />
        )}
      </div>
    </Box>
  );
};

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  borderRadius: 8,
  "& .MuiOutlinedInput-root": {
    color: theme.palette.text.primary,
    fontWeight: 400,
    fontSize: "15px",
    caretColor: "transparent",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&.MuiDatePicker-root .MuiInputBase-input": {
    padding: "2px 4px",
  },
  "&.MuiDatePicker-root div .MuiTypography-root": {
    padding: "2px 8px",
  },
}));

export default StyledDatePicker;
