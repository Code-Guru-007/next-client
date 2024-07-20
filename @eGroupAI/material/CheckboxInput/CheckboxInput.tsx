import React, { forwardRef } from "react";

import withStyles from "@mui/styles/withStyles";

import Input, { InputProps } from "@mui/material/Input";
import CheckboxWithLabel, {
  CheckboxWithLabelProps,
} from "../CheckboxWithLabel";

const StyledInput = withStyles({
  formControl: {
    "label + &": {
      marginTop: 0,
    },
  },
})(Input);

export interface CheckboxInputProps extends CheckboxWithLabelProps {
  /**
   * Mui `Input` Props
   */
  MuiInputProps?: InputProps;
  /**
   * Enable show/hide input if checked/unchecked.
   */
  toggleInput?: boolean;
  /**
   * @ignore
   */
  defaultChecked?: boolean;
}

const CheckboxInput = forwardRef<unknown, CheckboxInputProps>((props, ref) => {
  const {
    checked,
    defaultChecked,
    onChange,
    MuiInputProps,
    toggleInput,
    ...other
  } = props;

  if (toggleInput) {
    return (
      <>
        <CheckboxWithLabel
          ref={ref}
          checked={checked}
          onChange={onChange}
          {...other}
          id={`checkbox-${other.id}`}
        />
        {checked && <StyledInput {...MuiInputProps} />}
      </>
    );
  }

  return (
    <CheckboxWithLabel
      ref={ref}
      checked={checked}
      onChange={onChange}
      {...other}
      id={`checkbox-${other.id}`}
    />
  );
});

export default CheckboxInput;
