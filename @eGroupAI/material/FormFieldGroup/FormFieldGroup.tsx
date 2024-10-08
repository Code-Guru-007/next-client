import React, { forwardRef, HTMLAttributes } from "react";

import clsx from "clsx";
import { Theme, InputLabel, InputLabelProps } from "@mui/material";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";

const styles = (theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
  },
  disableMarginBottom: {
    marginBottom: 0,
  },
  labelContainer: {
    marginBottom: theme.spacing(1),
  },
  label: {
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightBold,
  },
});

export interface FormFieldGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * if `true`, the label will indicate that the input is required.
   */
  required?: boolean;
  /**
   * if `true`, disable the margin bottom.
   */
  disableMarginBottom?: boolean;
  /**
   * The contents of the `InputLabel`.
   */
  label?: string;
  /**
   * Props applied to the Mui `InputLabel` element.
   */
  MuiInputLabelProps?: InputLabelProps;
}

const FormFieldGroup = forwardRef<
  HTMLDivElement,
  FormFieldGroupProps & WithStyles<typeof styles>
>((props, ref) => {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    children,
    className,
    classes,
    required,
    label,
    disableMarginBottom,
    MuiInputLabelProps,
    ...other
  } = props;

  return (
    <div
      ref={ref}
      className={clsx(
        classes.root,
        {
          [classes.disableMarginBottom]: disableMarginBottom,
        },
        className
      )}
      {...other}
    >
      <div className={classes.labelContainer}>
        <InputLabel
          className={classes.label}
          required={required}
          {...MuiInputLabelProps}
        >
          {wordLibrary?.label ?? label}
        </InputLabel>
      </div>
      {children}
    </div>
  );
});

export default withStyles(styles, {
  name: "MuiEgFormFieldGroup",
})(FormFieldGroup);
