import React, { FC } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import Typography from "@eGroupAI/material/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(),
    [theme.breakpoints.down("md")]: {
      marginTop: 0,
    },
  },
  date: {
    "& span": {
      fontSize: theme.typography.h6.fontSize,
    },
  },
  time: {
    marginTop: theme.spacing(2.5),
    [theme.breakpoints.down("md")]: {
      marginTop: theme.spacing(0.5),
    },
  },
}));

export interface EventDateProps {
  month?: string;
  day?: string;
  time?: string;
}

const EventDate: FC<EventDateProps> = function (props) {
  const classes = useStyles();
  const { month, day, time } = props;
  const hasDate = Boolean(month && day);
  const hasTime = Boolean(time);

  return (
    <div className={classes.root}>
      {hasDate && (
        <Typography
          variant="h4"
          gutterBottom={hasTime}
          className={classes.date}
        >
          {day} <span>{month}</span>
        </Typography>
      )}
      {hasTime && (
        <Typography variant="body1" className={clsx(!hasDate && classes.time)}>
          {time}
        </Typography>
      )}
    </div>
  );
};

export default EventDate;
