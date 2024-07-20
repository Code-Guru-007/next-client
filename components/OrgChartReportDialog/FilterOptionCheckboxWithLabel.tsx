import React, { forwardRef } from "react";

import CheckboxWithLabel, {
  CheckboxWithLabelProps,
} from "@eGroupAI/material/CheckboxWithLabel";
import { Value } from "@eGroupAI/material-lab/FilterDropDown";

export interface Props extends Omit<CheckboxWithLabelProps, "value"> {
  defaultChecked?: boolean;
  setFilterOptionsTempValue?: React.Dispatch<React.SetStateAction<Value>>;
  value?: string;
}

const FilterOptionCheckboxWithLabel = forwardRef<HTMLInputElement, Props>(
  (props, ref) => {
    const {
      defaultChecked = false,
      checked,
      MuiCheckboxProps,
      setFilterOptionsTempValue,
      value,
      label,
      onChange: onChangeProp,
      ...others
    } = props;
    return (
      <CheckboxWithLabel
        ref={ref}
        checked={checked || defaultChecked}
        MuiCheckboxProps={{
          onChange: (e, checked) => {
            if (onChangeProp) onChangeProp(e, checked);
          },
          ...MuiCheckboxProps,
        }}
        value={value}
        label={label}
        {...others}
      />
    );
  }
);

export default FilterOptionCheckboxWithLabel;
