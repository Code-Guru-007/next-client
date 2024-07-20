import React, { FC, useEffect, useState, useMemo, useRef } from "react";
import { Box, ClickAwayListener, Paper, Popper, alpha } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { format, isValid } from "date-fns";

import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import DateInputMask from "./DateInputMask";
import Menu from "./Menu";

const useStyles = makeStyles((theme) => ({
  hourTime: {
    width: "100%",
    display: "inline-flex",
  },
  hour: {
    width: "30%",
    display: "flex",
    justifyContent: "center",
  },
  separator: {
    width: "40%",
    display: "flex",
    justifyContent: "center",
  },
  time: {
    width: "30%",
    display: "flex",
    justifyContent: "center",
  },
  hourTimeTypo: {
    width: "70px",
    display: "flex",
    justifyContent: "space-around",
  },
  hourTypo: {
    width: "30%",
    display: "flex",
    justifyContent: "center",
  },
  separatorTypo: {
    width: "40%",
    display: "flex",
    justifyContent: "center",
  },
  timeTypo: {
    width: "30%",
    display: "flex",
    justifyContent: "center",
  },
  popper: {
    border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
    "&": { zIndex: theme.zIndex.modal + 100, margin: "10px 0px !important" },
    "& .MuiPaper-root": {
      overflowY: "hidden",
    },
  },
}));

export interface MaskedDateInputPickerProps {
  defaultDate: Date | null;
  minDate: Date;
  maxDate: Date;
  disableYearMonth: boolean;
  onSetDate: (day: Date | null) => void;
  activePanel?: "date" | "time";
  setActivePanel?: React.Dispatch<
    React.SetStateAction<"date" | "time" | undefined>
  >;
  onSave?: () => void;
  name?: string;
  required?: boolean;
}

const MaskedDateInputPicker: FC<MaskedDateInputPickerProps> = (props) => {
  const classes = useStyles(props);
  const {
    defaultDate: dateProp,
    minDate,
    maxDate,
    disableYearMonth,
    onSetDate,
    activePanel,
    setActivePanel,
    onSave,
    name,
    required,
  } = props;
  const dateString = useMemo(() => {
    if (dateProp) return format(dateProp, "yyyy-MM-dd");
    return "";
  }, [dateProp]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLInputElement | null>(null);
  const [value, setValue] = useState(dateString);
  const [date, setDate] = useState(dateProp);

  const handleOnInputChange = (inputValue: string) => {
    try {
      setValue(inputValue);

      if (new Date(inputValue) > maxDate) {
        setValue(format(maxDate, "yyyy-MM-dd"));
        setDate(maxDate);
        onSetDate(maxDate);
      }
      if (new Date(inputValue) < minDate) {
        setValue(format(minDate, "yyyy-MM-dd"));
        setDate(minDate);
        onSetDate(minDate);
      }

      const inputDate = new Date(inputValue);
      if (isValid(inputDate) && minDate < inputDate && inputDate < maxDate) {
        setDate(inputDate);
        onSetDate(inputDate);
      }

      if (inputValue === "" || inputValue === "____-__-__") {
        setDate(null);
        onSetDate(null);
      }
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: MaskedDateInputPicker handleOnInputChange",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
    if (setActivePanel) setActivePanel("date");
  };

  const handleClickAway = () => {
    if (setActivePanel && activePanel === "date") {
      setActivePanel(undefined);
      if (!isValid(new Date(value))) {
        setValue(dateString);
        setDate(dateProp);
      } else {
        setValue(value);
        setDate(new Date(value));
      }
    }
  };

  const handleSetDay = (date: Date) => {
    try {
      onSetDate(date);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      if (setActivePanel) setActivePanel(undefined);
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: MaskedDateInputPicker handleSetDay to Menu",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleClear = () => {
    try {
      setValue("");
      setDate(null);
      onSetDate(null);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: MaskedDateInputPicker handleClear",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  useEffect(() => {
    setValue(dateString as string);
  }, [dateString]);

  useEffect(() => {
    setDate(dateProp);
  }, [dateProp]);

  return (
    <Box sx={{ position: "relative" }}>
      <DateInputMask
        name={name}
        required={required}
        value={value}
        onChange={handleOnInputChange}
        onSave={onSave}
        onClick={handleClick}
        ref={inputRef}
      />
      <ClickAwayListener onClickAway={handleClickAway}>
        <Popper
          placement="bottom-start"
          anchorEl={anchorEl}
          open={activePanel === "date"}
          className={classes.popper}
        >
          <Paper>
            <Menu
              date={date}
              minDate={minDate}
              maxDate={maxDate}
              disableYearMonth={disableYearMonth}
              onDayClick={handleSetDay}
              onClear={handleClear}
            />
          </Paper>
        </Popper>
      </ClickAwayListener>
    </Box>
  );
};

export default MaskedDateInputPicker;
