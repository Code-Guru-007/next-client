import React, { FC, useState } from "react";
import {
  CalendarToday,
  CalendarNav,
  CalendarNext,
  CalendarPrev,
} from "@mobiscroll/react";
import { makeStyles } from "@mui/styles";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import Box from "@eGroupAI/material/Box";
import Button from "@eGroupAI/material/Button";
import Menu from "@eGroupAI/material/Menu";
import MenuItem from "@eGroupAI/material/MenuItem";
import Hidden from "@eGroupAI/material/Hidden";

import { DISPLAY_NAMES } from "./utils";

const CANLENDAR_LAYOUT = [
  { title: DISPLAY_NAMES.DAY.zh, function: "day" },
  {
    title: DISPLAY_NAMES.WEEK.zh,
    function: "week",
  },
  {
    title: DISPLAY_NAMES.MONTH.zh,
    function: "month",
  },
];

const useStyles = makeStyles(() => ({
  blueOutlinedBtn: {
    minWidth: 50,
  },
  borderBottom: {
    borderBottom: "1px solid #e3e6f0!important",
    padding: "10px",
  },
  header: {
    "& .mbsc-calendar-button-today": {
      border: "1px solid #dadce0",
    },
  },
}));

interface CalendarHeaderProps {
  selectedLayoutOption: string;
  handleChangeLayout: (layout: string) => void;
}

const CalendarHeader: FC<CalendarHeaderProps> = (props) => {
  const classes = useStyles();

  const { selectedLayoutOption, handleChangeLayout } = props;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Box
      display="flex"
      alignItems="center"
      width="100%"
      className={classes.header}
      flexWrap="wrap"
    >
      <Box display="flex" alignItems="center">
        <CalendarToday />
        <CalendarPrev />
        <CalendarNext />
        <CalendarNav />
      </Box>
      <Hidden xsDown>
        <Box ml="auto">
          <Button
            className={classes.blueOutlinedBtn}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            rounded
            variant="contained"
            color="primary"
            endIcon={<ArrowDropDownIcon />}
          >
            {
              CANLENDAR_LAYOUT.find(
                (item) => item.function === selectedLayoutOption
              )?.title
            }
          </Button>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {CANLENDAR_LAYOUT.map((option) => (
              <MenuItem
                key={option.function}
                onClick={() => {
                  handleChangeLayout(option.function);
                  setAnchorEl(null);
                }}
              >
                <Box p={1} display="flex" justifyContent="flex-start">
                  {option.title}
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Hidden>
    </Box>
  );
};

export default CalendarHeader;
