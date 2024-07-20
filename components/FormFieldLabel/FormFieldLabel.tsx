import React, { FC, HTMLAttributes } from "react";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";

import Typography from "@eGroupAI/material/Typography";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
}));

export interface FormFieldLabelProps extends HTMLAttributes<HTMLDivElement> {
  primary?: string;
}

const FormFieldLabel: FC<FormFieldLabelProps> = function (props) {
  const { className, primary, children, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(className, classes.root)} {...other}>
      <Typography variant="h5" gutterBottom>
        {primary}
      </Typography>
      {children}
    </div>
  );
};

export default FormFieldLabel;
