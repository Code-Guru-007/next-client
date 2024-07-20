import React from "react";
import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
} from "@mui/material";

declare module "@mui/material/Checkbox" {
  interface CheckboxPropsSizeOverrides {
    large: true;
  }
}

export type CheckboxProps = MuiCheckboxProps;

const Checkbox = (props: CheckboxProps) => (
  <MuiCheckbox disableRipple {...props} />
);

export default Checkbox;
