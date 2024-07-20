import React, { FC, HTMLAttributes, useState } from "react";
import { Box, MenuItem, styled, Typography } from "@mui/material";
import ClickAwayListener from "@mui/material/ClickAwayListener";

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

export type Time = [string, string];
export interface TimePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  onChange?: (hm: string) => void;
  setShowBorder?: (show: boolean) => void;
}

const TimePicker: FC<TimePickerProps> = (props) => {
  const { onChange, setShowBorder } = props;
  const [value, setValue] = useState(hoursMinute[0]);
  const [isShow, setIsShow] = useState(false);

  const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    color: theme.palette.grey[500],
    fontSize: 13,
    fontWeight: 500,
  }));
  const style = {
    root: {
      padding: "2px 8px ",
      borderRadius: isShow ? "3px" : "35px",
      color: isShow ? "#000" : "#9e9e9e",
      fontWeight: 400,
      fontSize: "15px",
      background: isShow ? "#eeeeee" : "#f5f5f5",
      maxWidth: "110px",
      borderBottom: isShow ? "1px solid #9E9E9E" : "1px solid #f5f5f5",
      textAlign: "right",
    },
  };

  const handleClickAwayPopup = () => {
    setIsShow(false);
  };

  return (
    <>
      <Typography
        onClick={() => {
          setIsShow(!isShow);
          if (setShowBorder) {
            setShowBorder(!isShow);
          }
        }}
        sx={style.root}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          position: "absolute",
          height: 282,
          marginLeft: "0px",
          overflowX: "hidden",
          overflowY: "auto",
          background: "#FFFFFF",
          boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.16)",
          marginTop: "15px",
        }}
      >
        {isShow && (
          <ClickAwayListener onClickAway={handleClickAwayPopup}>
            <Box
              sx={{
                position: "relative",
                right: 0,
                width: "78px",
              }}
            >
              {hoursMinute.map((hm) => (
                <StyledMenuItem
                  style={{ background: hm === value ? "#DEEAFB" : "" }}
                  key={hm}
                  value={hm}
                  onClick={() => {
                    setIsShow(!isShow);
                    if (setShowBorder) {
                      setShowBorder(!isShow);
                    }
                    setValue(hm);
                    if (onChange) {
                      onChange(hm);
                    }
                  }}
                >
                  {hm}
                </StyledMenuItem>
              ))}
            </Box>
          </ClickAwayListener>
        )}
      </Typography>
    </>
  );
};

export default TimePicker;
