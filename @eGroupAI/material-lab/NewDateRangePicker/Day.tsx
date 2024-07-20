import React from "react";

import clsx from "clsx";

import { IconButton, Typography, Theme } from "@mui/material";

import { WithStyles } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

const startBorderStyle = {
  borderRadius: "50% 0 0 50%",
};
const endBorderStyle = {
  borderRadius: "0 50% 50% 0",
};
const styles = (theme: Theme) =>
  createStyles({
    inRange: {
      backgroundColor: theme.palette.primary.main,
      "&:first-child": startBorderStyle,
      "&:last-child": endBorderStyle,
    },
    startBorder: startBorderStyle,
    endBorder: endBorderStyle,
    buttonContainer: {
      display: "flex",
      borderWidth: 2,
      borderColor: "transparent",
    },
    button: {
      height: 36,
      width: 36,
      transform: "scale(1.1)",
      color: theme.palette.text.primary,
      "&:hover": {
        backgroundColor: theme.palette.background.neutral,
      },
    },
    buttonText: {
      lineHeight: 1.6,
      "&:hover": {},
    },
    outlined: {
      "& .MuiEgDay-buttonText": {
        color: theme.palette.primary.dark,
      },
    },
    filled: {
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
      backgroundColor: theme.palette.primary.dark,
    },
    hovered: {
      borderTopColor: theme.palette.action.focus,
      borderBottomColor: theme.palette.action.focus,
      background: theme.palette.primary.main,
      "&:first-child": {
        ...startBorderStyle,
        borderLeftColor: theme.palette.action.focus,
      },
      "&:last-child": {
        ...endBorderStyle,
        borderRightColor: theme.palette.action.focus,
      },
    },
    hoveredStart: {
      ...startBorderStyle,
      borderLeftColor: theme.palette.action.focus,
    },
    hoveredEnd: {
      ...endBorderStyle,
      borderRightColor: theme.palette.action.focus,
    },
    contrast: {
      color: theme.palette.primary.contrastText,
    },
    invisible: {
      visibility: "hidden",
    },
  });
export interface DayProps extends WithStyles<typeof styles> {
  filled: boolean;
  outlined: boolean;
  isInDateRange: boolean;
  isInHoveredRange: boolean;
  disabled?: boolean;
  invisible: boolean;
  startOfDateRange: boolean;
  endOfDateRange: boolean;
  startOfHoveredRange: boolean;
  endOfHoveredRange: boolean;
  onClick?: () => void;
  onHover?: () => void;
  value: number | string;
  startDateData?: Date;
  endDateData?: Date;
}
const Day: React.FC<DayProps> = ({
  classes,
  startOfDateRange,
  endOfDateRange,
  disabled,
  isInDateRange,
  onClick,
  onHover,
  filled,
  isInHoveredRange,
  value,
  outlined,
  invisible,
  endOfHoveredRange,
  startOfHoveredRange,
  startDateData,
  endDateData,
}) => {
  const enable = !disabled && !invisible;

  const currentDate = new Date().setHours(0, 0, 0, 0);
  const from = startDateData
    ? new Date(startDateData).setHours(0, 0, 0, 0)
    : undefined;
  const to = endDateData
    ? new Date(endDateData).setHours(0, 0, 0, 0)
    : undefined;
  const check = new Date(currentDate).setHours(0, 0, 0, 0);
  const shouldOutlined = check === from || check === to;

  return (
    <div
      className={clsx(
        classes.buttonContainer,
        invisible && classes.invisible,
        startOfDateRange && classes.startBorder,
        endOfDateRange && classes.endBorder,
        enable && isInDateRange && classes.inRange,
        enable && isInHoveredRange && classes.hovered,
        enable && isInHoveredRange && endOfHoveredRange && classes.hoveredEnd,
        enable &&
          isInHoveredRange &&
          startOfHoveredRange &&
          classes.hoveredStart
      )}
    >
      <IconButton
        className={clsx(
          classes.button,
          !disabled && outlined && classes.outlined,
          !disabled && filled && classes.filled
        )}
        disabled={disabled}
        onClick={onClick}
        onMouseOver={onHover}
        size="large"
      >
        <Typography
          color={disabled ? "textSecondary" : "textPrimary"}
          className={clsx(
            classes.buttonText,
            !disabled && filled && classes.contrast
          )}
          style={{ color: shouldOutlined && outlined ? "white" : "" }}
          variant="body2"
        >
          {value}
        </Typography>
      </IconButton>
    </div>
  );
};

export default withStyles(styles, {
  name: "MuiEgDay",
})(Day);
