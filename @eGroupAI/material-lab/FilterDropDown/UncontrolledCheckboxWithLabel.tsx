import React, { forwardRef } from "react";

import CheckboxWithLabel, {
  CheckboxWithLabelProps,
} from "@eGroupAI/material/CheckboxWithLabel";
import { Value } from "./types";

export interface Props extends Omit<CheckboxWithLabelProps, "value"> {
  defaultChecked?: boolean;
  setFilterOptionsTempValue?: React.Dispatch<React.SetStateAction<Value>>;
  value?: string;
}

const UncontrolledCheckboxWithLabel = forwardRef<HTMLInputElement, Props>(
  (props, ref) => {
    const {
      defaultChecked = false,
      MuiCheckboxProps,
      setFilterOptionsTempValue,
      value,
      label,
      ...others
    } = props;
    return (
      <CheckboxWithLabel
        ref={ref}
        checked={defaultChecked}
        MuiCheckboxProps={{
          onChange: (e) => {
            if (value === "EGROUP_EMPTY" && label === "無資料") {
              if (setFilterOptionsTempValue) {
                if (e.target.checked) {
                  setFilterOptionsTempValue((prev) => ({
                    ...prev,
                    [others.name as string]: [value as string],
                  }));
                } else {
                  setFilterOptionsTempValue((prev) => ({
                    ...prev,
                    [others.name as string]: [],
                  }));
                }
              }
            } else if (setFilterOptionsTempValue) {
              setFilterOptionsTempValue((prev) => {
                const v = [
                  ...((prev[others.name as string] as string[]) || []),
                ];
                const filtered = v.filter((item) => item !== "EGROUP_EMPTY");
                if (filtered?.includes(value as string)) {
                  const newV = filtered.filter((s) => s !== value);
                  return {
                    ...prev,
                    [others.name as string]: newV,
                  };
                }
                const t = filtered;
                t.push(value as string);
                return {
                  ...prev,
                  [others.name as string]: t,
                };
              });
            }
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

export default UncontrolledCheckboxWithLabel;
