import React, { FC, useMemo, useState, useRef } from "react";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

import { FormControlLabel, Checkbox, TextField, Grid } from "@mui/material";

export type DynamicFormControlCheckboxProp = {
  name: string;
  value: string;
  label?: string;
  checked?: boolean;
  required?: boolean;
  handleChange: (checked: boolean, value: string) => void;
  hasRemark?: boolean;
  requiredRemark?: boolean;
  handleRemarkChange?: (name: string, v?: string) => void;
  targetValue: string;
  defaultRemark?: string;
  remarkError?: string;
  disable?: boolean;
};

const DynamicFormControlCheckbox: FC<DynamicFormControlCheckboxProp> =
  function (props) {
    const {
      name,
      value,
      label,
      checked,
      required,
      handleChange,
      hasRemark = false,
      requiredRemark = false,
      handleRemarkChange,
      defaultRemark,
      targetValue,
      remarkError,
      disable,
    } = props;

    const [remarkValue, setRemarkValue] = useState(defaultRemark || "");
    const wordLibrary = useSelector(getWordLibrary);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleCheckboxChange = () => {
      // Check if the inputRef exists and focus on it
      if (inputRef && inputRef.current) {
        inputRef.current.focus();
      }
    };

    const renderCheckbox = useMemo(
      () => (
        <FormControlLabel
          label={label || "Undefined"}
          value={value || ""}
          control={
            <Checkbox
              required={required}
              checked={checked}
              disabled={disable}
              name={name}
              onChange={(e) => {
                handleChange(e.target.checked, e.target.value);
                if (!e.target.checked) {
                  setRemarkValue("");
                  if (handleRemarkChange) {
                    handleRemarkChange(name, "");
                  }
                } else {
                  handleCheckboxChange();
                }
              }}
            />
          }
          style={{ whiteSpace: "pre-wrap" }}
        />
      ),
      [
        checked,
        handleChange,
        handleRemarkChange,
        label,
        name,
        required,
        value,
        disable,
      ]
    );

    return (
      <Grid item xs={hasRemark && 12}>
        <Grid container alignItems="center">
          <Grid item flex={1}>
            {renderCheckbox}
          </Grid>
          {hasRemark && (
            <Grid item flex={2}>
              <TextField
                value={remarkValue}
                inputRef={inputRef}
                label={wordLibrary?.remark ?? "備註"}
                size="small"
                disabled={disable}
                placeholder={wordLibrary?.["enter remarks"] ?? "輸入備註"}
                onChange={(e) => {
                  setRemarkValue(e.target.value);
                  handleChange(!!e.target.value, value);
                }}
                onBlur={(e) => {
                  if (handleRemarkChange) {
                    handleRemarkChange(name, e.target.value);
                  }
                }}
                required={
                  requiredRemark &&
                  !!value &&
                  targetValue
                    ?.split(",")
                    .map((v) => v === value)
                    .includes(true)
                }
                fullWidth
                error={
                  requiredRemark &&
                  !!value &&
                  targetValue
                    ?.split(",")
                    .map((v) => v === value)
                    .includes(true) &&
                  !!remarkError &&
                  !remarkValue
                }
              />
            </Grid>
          )}
        </Grid>
      </Grid>
    );
  };

export default React.memo(DynamicFormControlCheckbox);
