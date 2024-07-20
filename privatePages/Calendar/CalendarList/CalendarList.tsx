import React, { useState } from "react";

import { makeStyles } from "@mui/styles";
import { OrganizationCalendar } from "interfaces/entities";
import { useSelector } from "react-redux";

import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import ButtonMenu from "@eGroupAI/material-module/ButtonMenu";
import Collapse from "@eGroupAI/material/Collapse";
import List from "@eGroupAI/material/List";
import ListItem from "@eGroupAI/material/ListItem";
import ListItemText from "@eGroupAI/material/ListItemText";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import Typography from "@eGroupAI/material/Typography";
import Checkbox, { CheckboxProps } from "@eGroupAI/material/Checkbox";
import Box from "@eGroupAI/material/Box";
import MenuItem, { MenuItemProps } from "@eGroupAI/material/MenuItem";
import ButtonBase, { ButtonBaseProps } from "@eGroupAI/material/ButtonBase";
import CircularProgress from "@eGroupAI/material/CircularProgress";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { Tooltip } from "@eGroupAI/material";

import { DISPLAY_NAMES } from "../utils";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 36,
  },
  calendarsTool: {
    display: "flex",
    alignItems: "center",
  },
  toolBtn: {
    color: theme.palette.grey[500],
    borderRadius: "50%",
  },
  loader: {
    padding: 36,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    boxShadow: theme.shadows[3],
    borderRadius: 4,
  },
}));

type HandleCalendarMenuItemClick = (
  el: OrganizationCalendar
) => MenuItemProps["onClick"];

export type OnCalendarMenuItemClick = (
  e: React.MouseEvent<HTMLLIElement, MouseEvent>,
  el: OrganizationCalendar
) => void;

export interface CalendarListProps {
  calendars?: OrganizationCalendar[];
  editable?: boolean;
  onCalendarAddClick?: ButtonBaseProps["onClick"];
  onCalendarChange?: CheckboxProps["onChange"];
  onCalendarEditClick?: OnCalendarMenuItemClick;
  onCalendarDeleteClick?: OnCalendarMenuItemClick;
}

const CalendarList = (props: CalendarListProps) => {
  const {
    calendars,
    editable,
    onCalendarAddClick,
    onCalendarChange,
    onCalendarEditClick,
    onCalendarDeleteClick,
  } = props;
  const classes = useStyles();
  const [showList, setShowList] = useState(true);
  const wordLibrary = useSelector(getWordLibrary);

  const handleToggleList = () => {
    setShowList((v) => !v);
  };

  const handleCalendarEditClick: HandleCalendarMenuItemClick = (el) => (e) => {
    if (onCalendarEditClick) {
      onCalendarEditClick(e, el);
    }
  };

  const handleCalendarDeleteClick: HandleCalendarMenuItemClick =
    (el) => (e) => {
      if (onCalendarDeleteClick) {
        onCalendarDeleteClick(e, el);
      }
    };

  return (
    <div className={classes.root}>
      <div className={classes.calendarsTool}>
        <Typography variant="body2">
          {editable ? DISPLAY_NAMES.TOOGLE_CALENDAR.zh : "My Calendars"}
        </Typography>
        <Box flexGrow={1} />
        {editable && (
          <Tooltip title="Create Calendar">
            <ButtonBase
              className={classes.toolBtn}
              onClick={onCalendarAddClick}
            >
              <AddIcon />
            </ButtonBase>
          </Tooltip>
        )}
        <ButtonBase className={classes.toolBtn} onClick={handleToggleList}>
          {showList ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </ButtonBase>
      </div>
      {calendars ? (
        <Collapse in={showList} timeout="auto" unmountOnExit>
          <List dense disablePadding>
            {calendars.map((el) => (
              <ListItem key={el.organizationCalendarId} disableGutters>
                <ListItemIcon style={{ marginRight: 0 }}>
                  <Checkbox
                    edge="start"
                    value={el.organizationCalendarId}
                    tabIndex={-1}
                    disableRipple
                    style={{
                      color: el.organizationCalendarBackgroundColor,
                    }}
                    defaultChecked={el.isSelected === 1}
                    onChange={onCalendarChange}
                  />
                </ListItemIcon>
                <ListItemText>{el.organizationCalendarName}</ListItemText>
                {editable && !el.isDefault && (
                  <ButtonMenu
                    button={
                      <ButtonBase className={classes.toolBtn}>
                        <MoreVertIcon />
                      </ButtonBase>
                    }
                    className={classes.dropdown}
                  >
                    <MenuItem
                      onClick={handleCalendarEditClick(el)}
                      sx={{ padding: "6px 16px" }}
                    >
                      {wordLibrary?.edit ?? "編輯"}
                    </MenuItem>
                    <MenuItem
                      onClick={handleCalendarDeleteClick(el)}
                      sx={{ padding: "6px 16px" }}
                    >
                      {wordLibrary?.delete ?? "刪除"}
                    </MenuItem>
                  </ButtonMenu>
                )}
              </ListItem>
            ))}
          </List>
        </Collapse>
      ) : (
        <div className={classes.loader}>
          <CircularProgress size={24} />
        </div>
      )}
    </div>
  );
};

export default CalendarList;
