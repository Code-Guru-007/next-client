import React, {
  FC,
  HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, MenuItem, Paper, Popper, styled, useTheme } from "@mui/material";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { makeStyles } from "@mui/styles";
import { Focused } from "../NewDateRangePicker/types";
import TimeInputMask from "./TimeInputMask";

const times = [
  "00:00",
  "00:15",
  "00:30",
  "00:45",
  "01:00",
  "01:15",
  "01:30",
  "01:45",
  "02:00",
  "02:15",
  "02:30",
  "02:45",
  "03:00",
  "03:15",
  "03:30",
  "03:45",
  "04:00",
  "04:15",
  "04:30",
  "04:45",
  "05:00",
  "05:15",
  "05:30",
  "05:45",
  "06:00",
  "06:15",
  "06:30",
  "06:45",
  "07:00",
  "07:15",
  "07:30",
  "07:45",
  "08:00",
  "08:15",
  "08:30",
  "08:45",
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
  "10:45",
  "11:00",
  "11:15",
  "11:30",
  "11:45",
  "12:00",
  "12:15",
  "12:30",
  "12:45",
  "13:00",
  "13:15",
  "13:30",
  "13:45",
  "14:00",
  "14:15",
  "14:30",
  "14:45",
  "15:00",
  "15:15",
  "15:30",
  "15:45",
  "16:00",
  "16:15",
  "16:30",
  "16:45",
  "17:00",
  "17:15",
  "17:30",
  "17:45",
  "18:00",
  "18:15",
  "18:30",
  "18:45",
  "19:00",
  "19:15",
  "19:30",
  "19:45",
  "20:00",
  "20:15",
  "20:30",
  "20:45",
  "21:00",
  "21:15",
  "21:30",
  "21:45",
  "22:00",
  "22:15",
  "22:30",
  "22:45",
  "23:00",
  "23:15",
  "23:30",
  "23:45",
];

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
    "&": { zIndex: theme.zIndex.modal + 100, margin: "10px 0px !important" },
  },
}));

export interface MaskedTimeInputPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  setShowBorder?: React.Dispatch<React.SetStateAction<boolean>>;
  onChange?: (time: string) => void;
  defaultValue?: string;
  activePanel?: "date" | "time";
  setActivePanel?: React.Dispatch<
    React.SetStateAction<"date" | "time" | undefined>
  >;
  rangeFocused?: "start" | "end";
  setFocused?: React.Dispatch<React.SetStateAction<Focused | undefined>>;
  onSave?: () => void;
  setOpenCalendar?: React.Dispatch<React.SetStateAction<boolean>>;
  isClearTime?: boolean;
  onClearTime?: React.Dispatch<React.SetStateAction<boolean>>;
  enableOnBlurChange?: boolean;
}

const MaskedTimeInputPicker: FC<MaskedTimeInputPickerProps> = (props) => {
  const classes = useStyles(props);
  const {
    defaultValue: timeProp,
    onChange,
    setShowBorder,
    activePanel,
    setActivePanel,
    rangeFocused,
    setFocused,
    setOpenCalendar,
    isClearTime: isClearTimeProp,
    onClearTime,
    onSave,
    enableOnBlurChange = false,
  } = props;
  const timeString = useMemo(() => {
    if (timeProp) return timeProp;
    return "";
  }, [timeProp]);
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const menuDiv = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(timeString);
  useEffect(() => {
    if (timeString) {
      setValue(timeString);
    }
  }, [timeString]);
  const [searchedIndex, setSearchedIndex] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<HTMLInputElement | null>(null);

  const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: 13,
    fontWeight: 500,
    "&:hover": {
      background: theme.palette.action.active,
    },
  }));

  const handleClickAwayPopup = () => {
    if (setActivePanel && activePanel === "time") {
      setActivePanel(undefined);
      if (setShowBorder) setShowBorder(false);
    }
  };

  const handleListOnInputChange = (inputTime: string) => {
    const regV0 = inputTime[0] === "_" ? `[0-2]` : `[${inputTime[0]}]`;
    const regV1 = inputTime[1] === "_" ? `[0-9]` : `[${inputTime[1]}]`;
    let regV5;
    switch (inputTime[5]) {
      case "_":
        regV5 = "0";
        break;
      case "2":
        regV5 = "1";
        break;
      case "5":
        regV5 = "4";
        break;
      default:
        regV5 = inputTime[5] as string;
        break;
    }
    const regV6 = "[05]";
    const regExp = `${regV0}${regV1}:${regV5}${regV6}`;
    const sIndex = times.findIndex((t) => t.search(regExp) !== -1);
    setSearchedIndex(sIndex);
    if (menuDiv.current) {
      const scrollHeight = menuDiv.current.scrollHeight as number;
      const height = menuDiv.current.clientHeight as number;
      menuDiv.current.scroll({
        top: (sIndex * scrollHeight) / times.length - height / 2,
      });
    }
  };

  const handleTimeChange = (sTime) => {
    setValue(sTime);
    if (inputRef.current) inputRef.current.focus();
    if (onChange) onChange(sTime);
    if (setShowBorder) setShowBorder(false);
    if (setActivePanel) setActivePanel(undefined);
  };

  const handleOnChange = (inputTime: string) => {
    if (onChange && !inputTime.includes("_")) {
      setValue(inputTime.replaceAll(" ", ""));
      onChange(inputTime.replaceAll(" ", ""));
    }
  };

  useEffect(() => {
    if (menuDiv.current && anchorEl) {
      const scrollHeight = menuDiv.current.scrollHeight as number;
      const height = menuDiv.current.clientHeight as number;
      menuDiv.current.scroll({
        top: (searchedIndex * scrollHeight) / times.length - height / 2,
      });
    }
  }, [searchedIndex, anchorEl]);

  useEffect(() => {
    if (isClearTimeProp) {
      if (rangeFocused === "start") setValue("00:00");
      else setValue("23:59");
      if (onClearTime) onClearTime(false);
    }
  }, [isClearTimeProp, rangeFocused, onClearTime]);

  const handleOpenShow = (e) => {
    setAnchorEl(e.currentTarget);
    if (inputRef.current) inputRef.current.focus();
    if (setShowBorder) setShowBorder(true);
    if (setOpenCalendar) setOpenCalendar(false);
    if (rangeFocused && setFocused) setFocused(rangeFocused);
    if (setActivePanel) setActivePanel("time");
  };

  return (
    <Box sx={{ position: "relative" }}>
      <TimeInputMask
        value={value as string}
        changeDropList={handleListOnInputChange}
        onClick={handleOpenShow}
        onChange={handleOnChange}
        onSave={onSave}
        ref={inputRef}
        enableOnBlurChange={enableOnBlurChange}
      />
      <ClickAwayListener onClickAway={handleClickAwayPopup}>
        <Popper
          placement="bottom-start"
          keepMounted
          anchorEl={anchorEl}
          open={activePanel === "time"}
          className={classes.popper}
        >
          <Paper
            ref={menuDiv}
            sx={{
              maxHeight: 252,
              zIndex: 500,
              overflowX: "hidden",
              overflowY: "auto",
            }}
          >
            <Box
              sx={{
                right: 0,
                width: "60px",
                height: "100%",
              }}
            >
              {times.map((hm) => (
                <StyledMenuItem
                  style={{
                    background: hm === value ? theme.palette.primary.light : "",
                    padding: "6px 10px",
                  }}
                  key={hm}
                  value={hm}
                  onClick={() => {
                    handleTimeChange(hm);
                  }}
                >
                  <div className={classes.hourTime}>
                    <div className={classes.hour}>{hm.split(":")[0]}</div>
                    <div className={classes.separator}>:</div>
                    <div className={classes.time}>{hm.split(":")[1]}</div>
                  </div>
                </StyledMenuItem>
              ))}
            </Box>
          </Paper>
        </Popper>
      </ClickAwayListener>
    </Box>
  );
};
export default React.memo(MaskedTimeInputPicker);
