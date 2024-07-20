import React, { FC, HTMLAttributes } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import CircularProgress from "@eGroupAI/material/CircularProgress";

const useStyles = makeStyles(() => ({
  root: {
    position: "relative",
  },
  loader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
}));

export interface FormProps extends HTMLAttributes<HTMLFormElement> {
  loading?: boolean;
}

const Form: FC<FormProps> = function (props) {
  const classes = useStyles();
  const { className, loading, children, ...other } = props;
  return (
    <form className={clsx(className, classes.root)} {...other}>
      {loading && (
        <div className={classes.loader}>
          <CircularProgress />
        </div>
      )}
      {children}
    </form>
  );
};

export default Form;
