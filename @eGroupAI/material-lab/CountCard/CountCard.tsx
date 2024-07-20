import React, { FC } from "react";

import { Paper, Typography, Skeleton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import * as MuiIcons from "@mui/icons-material";
import clsx from "clsx";

export type IconName = keyof typeof MuiIcons;
export interface CountCardProps {
  className?: string;
  iconName?: IconName;
  title?: string;
  count?: number;
  loading?: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3, 2.5),
    display: "flex",
    alignItems: "center",
    boxShadow: "0 3px 16px 0 rgba(10, 75, 109, 0.08)",
  },
  loader: {
    padding: theme.spacing(3, 2.5),
    boxShadow: "0 3px 16px 0 rgba(10, 75, 109, 0.08)",
  },
  iconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: theme.palette.info.main,
  },
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: theme.spacing(7.5),
    height: theme.spacing(7.5),
    color: theme.palette.common.white,

    "& .MuiSvgIcon-root": {
      fontSize: 40,
    },
  },
  content: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "1rem",
  },
  count: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: theme.palette.info.main,
  },
  title: {
    fontSize: 15,
    color: theme.palette.grey[200],
  },
}));

const CountCard: FC<CountCardProps> = (props) => {
  const { className, iconName = "ShowChart", count, title, loading } = props;
  const classes = useStyles();
  const Icon = MuiIcons[iconName];

  if (loading) {
    return (
      <Paper className={clsx(classes.loader, className)}>
        <Skeleton
          variant="rectangular"
          animation="wave"
          width="100%"
          height={15}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          width="100%"
          height={15}
          style={{ marginTop: 10 }}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          width="100%"
          height={15}
          style={{ marginTop: 10 }}
        />
      </Paper>
    );
  }

  return (
    <Paper className={clsx(classes.root, className)}>
      <div className={classes.iconBox}>
        {Icon && (
          <div className={classes.icon}>
            <Icon color="inherit" />
          </div>
        )}
      </div>
      <div className={classes.content}>
        <Typography className={classes.count}>{count}</Typography>
        <Typography className={classes.title}>{title}</Typography>
      </div>
    </Paper>
  );
};

export default CountCard;
