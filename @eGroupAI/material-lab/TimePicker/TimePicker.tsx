import React, { FC, HTMLAttributes, useState } from "react";
import { Box, MenuItem, styled, Typography, useTheme } from "@mui/material";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { makeStyles } from "@mui/styles";

const hoursMinute = [
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

const useStyles = makeStyles(() => ({
  hourTime: {
    width: "100%",
    display: "inline-flex",
    // justifyContent: "space-around",
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
}));

export type Time = string;
export interface TimePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  onChange?: any;
  setShowBorder?: any;
  isSetDate?: boolean;
  onViewChange?: any;
  defaultValue?: string;
}

const TimePicker: FC<TimePickerProps> = (props) => {
  const { onChange, setShowBorder, onViewChange, defaultValue, isSetDate } =
    props;

  const classes = useStyles();

  const [value, setValue] = useState(
    hoursMinute.includes(defaultValue as string) ? defaultValue : hoursMinute[0]
  );
  const [isShow, setIsShow] = useState(false);
  const theme = useTheme();
  const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: 13,
    fontWeight: 500,
    "&:hover": {
      background: "#F1F1F1",
    },
  }));

  const handleClickAwayPopup = () => {
    if (onViewChange) onViewChange(false);
    setIsShow(false);
  };

  return (
    <Box position="relative">
      <Typography
        onClick={() => {
          if (onViewChange) onViewChange(true);
          setIsShow(!isShow);
          setShowBorder(!isShow);
        }}
        sx={{
          padding: "2px 4px",
          borderRadius: "3px",
          color: isShow
            ? theme.palette.text.secondary
            : theme.palette.text.primary,
          fontWeight: 400,
          fontSize: "15px",
          background: isShow
            ? theme.palette.grey[600]
            : theme.palette.grey[800],
          maxWidth: "140px",
          textAlign: "right",
          borderBottom:
            isSetDate || hoursMinute.includes(defaultValue as string)
              ? "none"
              : `1px solid ${theme.palette.grey[300]}`,
        }}
      >
        {value?.split(":")[0]} : {value?.split(":")[1]}
      </Typography>
      <Box
        sx={{
          position: "absolute",
          height: 282,
          zIndex: 500,
          marginTop: "13px",
          overflowX: "hidden",
          overflowY: "auto",
          background: theme.palette.grey[700],
          boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.16)",
        }}
      >
        {isShow && (
          <ClickAwayListener onClickAway={handleClickAwayPopup}>
            <Box
              sx={{
                right: 0,
                width: "60px",
                background: theme.palette.common.white,
                height: "100%",
              }}
            >
              {hoursMinute.map((hm) => (
                <StyledMenuItem
                  style={{
                    background: hm === value ? theme.palette.primary.light : "",
                    padding: "6px 10px",
                  }}
                  key={hm}
                  value={hm}
                  onClick={() => {
                    setValue(hm);
                    onChange(hm);
                    setShowBorder(false);
                    setIsShow(false);
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
          </ClickAwayListener>
        )}
      </Box>
    </Box>
  );
};

export default TimePicker;
