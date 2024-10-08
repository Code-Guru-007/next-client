import React, { forwardRef, ReactNode, useState, useEffect } from "react";
import warning from "warning";
import FormControl, { FormControlProps } from "@mui/material/FormControl";
import FormLabel, { FormLabelProps } from "@mui/material/FormLabel";
import FormGroup, { FormGroupProps } from "@mui/material/FormGroup";
import FormHelperText, {
  FormHelperTextProps,
} from "@mui/material/FormHelperText";
import CheckboxInput, { CheckboxInputProps } from "../CheckboxInput";

export interface Value extends Record<string, any> {
  checked: boolean;
  text?: string;
}

export interface CheckboxInputGroupProps
  extends Omit<FormControlProps, "onChange"> {
  /**
   * The value of this group.
   */
  value?: Value;
  /**
   * The content of the FormLabel.
   */
  label?: string;
  /**
   * Options to generate group items.
   */
  options: CheckboxInputProps[];
  /**
   * The content of the FormHelperText.
   */
  helperText?: ReactNode;
  /**
   * Callback fired when the state is changed.
   */
  onChange?: (value: Value | any, name: string) => void;
  /**
   * Callback fired when the checkbox state is changed.
   */
  onCheckboxChange?: (
    value: Value | any,
    name: string,
    checked: boolean
  ) => void;
  /**
   * Callback fired when the input state is changed.
   */
  onInputChange?: (value: Value | any, name: string, text: string) => void;
  /**
   * Mui `FormLabel` Props
   */
  MuiFormLabelProps?: FormLabelProps;
  /**
   * Mui `FormGroup` Props
   */
  MuiFormGroupProps?: FormGroupProps;
  /**
   * Mui `FormHelperText` Props
   */
  MuiFormHelperTextProps?: FormHelperTextProps;
}

const CheckboxInputGroup = forwardRef<HTMLDivElement, CheckboxInputGroupProps>(
  (props, ref) => {
    const {
      label,
      options,
      helperText,
      MuiFormLabelProps,
      MuiFormGroupProps,
      MuiFormHelperTextProps,
      children,
      value: valueProp,
      onChange,
      onCheckboxChange,
      onInputChange,
      ...other
    } = props;
    const [value, setValue] = useState(valueProp ?? {});

    warning(
      children === undefined,
      "CheckboxInputGroup should not has children please use `options` only!"
    );

    useEffect(() => {
      setValue(valueProp || {});
    }, [valueProp]);

    const handleChange = (nextValue: any | Value, name: string) => {
      if (onChange) {
        onChange(nextValue, name);
      }
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
      const newValue = {
        ...value,
        [name]: {
          ...value[name],
          checked,
        },
      } as Value;
      setValue(newValue);
      if (onCheckboxChange) {
        onCheckboxChange(newValue, name, checked);
      }
      handleChange(newValue, name);
    };

    return (
      <FormControl ref={ref} {...other}>
        <FormLabel {...MuiFormLabelProps}>{label}</FormLabel>
        <FormGroup {...MuiFormGroupProps}>
          {options.map((option) => {
            const { name = "" } = option;
            return (
              <CheckboxInput
                key={option.name}
                name={name}
                checked={Boolean(value[name]?.checked)}
                onChange={(e, checked) => handleCheckboxChange(name, checked)}
                MuiInputProps={{
                  value: value[name]?.text,
                  inputProps: {
                    id: option.id,
                  },
                }}
                {...option}
              />
            );
          })}
        </FormGroup>
        {helperText && (
          <FormHelperText {...MuiFormHelperTextProps}>
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);

export default CheckboxInputGroup;
