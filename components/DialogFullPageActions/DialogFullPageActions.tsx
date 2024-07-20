import React, { FC, HTMLAttributes } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(3),
    gap: theme.spacing(1),
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

export type DialogFullPageActionsProps = HTMLAttributes<HTMLDivElement>;

const DialogFullPageActions: FC<DialogFullPageActionsProps> = function (props) {
  const { className, ...other } = props;
  const classes = useStyles();
  return <div className={clsx(className, classes.root)} {...other} />;
};

export default DialogFullPageActions;
