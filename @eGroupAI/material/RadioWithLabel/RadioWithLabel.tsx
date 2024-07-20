import React, { forwardRef, Key } from "react";
import {
  FormControlLabel,
  RadioProps,
  FormControlLabelProps,
} from "@mui/material";
import Radio from "../Radio";

export interface RadioWithLabelProps
  extends Omit<FormControlLabelProps, "control" | "onChange"> {
  key?: Key;
  /**
   * Callback fired when the state is changed.
   *
   * @param {object} event The event source of the callback.
   * You can pull out the new checked state by accessing `event.target.checked` (boolean).
   */
  onChange?: RadioProps["onChange"];
  /**
   * The size of the checkbox.
   * `small` is equivalent to the dense checkbox styling.
   */
  size?: RadioProps["size"];
  /**
   * Mui `Radio` props
   */
  MuiRadioProps?: RadioProps;
}

const RadioWithLabel = forwardRef<unknown, RadioWithLabelProps>(
  (props, ref) => {
    const { MuiRadioProps, onChange, ...other } = props;

    return (
      <FormControlLabel
        ref={ref}
        control={<Radio {...MuiRadioProps} onChange={onChange} />}
        {...other}
      />
    );
  }
);

export default RadioWithLabel;
