import React, { forwardRef } from "react";
import {
  FormControlLabel,
  CheckboxProps as MuiCheckboxProps,
  FormControlLabelProps,
} from "@mui/material";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";

import CheckBox from "@eGroupAI/material/Checkbox";

export interface CheckboxWithLabelProps
  extends Omit<FormControlLabelProps, "control"> {
  /**
   * Mui `Checkbox` props
   */
  MuiCheckboxProps?: MuiCheckboxProps;
}

const useStyles = makeStyles(
  () => ({
    root: {
      // "& span.MuiTypography-root.MuiFormControlLabel-label": {
      //   color: theme.palette.grey[700],
      // },
    },
  }),
  { name: "EgCheckboxWithLabel" }
);

const CheckboxWithLabel = forwardRef<unknown, CheckboxWithLabelProps>(
  (props, ref) => {
    const classes = useStyles();
    const { MuiCheckboxProps, className, label: labelProp, ...other } = props;
    return (
      <FormControlLabel
        ref={ref}
        className={clsx(classes.root, className)}
        control={
          <CheckBox
            disableRipple
            {...MuiCheckboxProps}
            id={`checkbox-input-${other.value}`}
            data-tid={`checkbox-input-${other.value}`}
          />
        }
        label={labelProp || ""}
        {...other}
      />
    );
  }
);
export default CheckboxWithLabel;
