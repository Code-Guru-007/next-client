import React, { FC, useState, useEffect, useRef } from "react";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

import { FormControlLabel, Radio, TextField, Grid } from "@mui/material";

export type DynamicFormControlRadioProp = {
  name: string;
  label?: string;
  value?: string;
  required?: boolean;
  handleRequired?: (v?: string) => void;
  handleChange?: (name: string, value?: string) => void;
  hasRemark?: boolean;
  requiredRemark?: boolean;
  handleRemarkChange?: (name: string, v?: string) => void;
  defaultRemark?: string;
  targetValue: string;
  remarkError?: string;
  id?: string;
};

const DynamicFormControlRadio: FC<DynamicFormControlRadioProp> = function (
  props
) {
  const {
    name,
    label,
    value,
    required,
    handleRequired,
    handleChange,
    hasRemark = false,
    requiredRemark = false,
    handleRemarkChange,
    defaultRemark,
    targetValue,
    remarkError,
    id,
    ...other
  } = props;

  const wordLibrary = useSelector(getWordLibrary);
  const remarkRef = useRef<HTMLInputElement>(null);
  const [remarkValue, setRemarkValue] = useState(defaultRemark || "");

  useEffect(() => {
    if (remarkRef.current) {
      remarkRef.current.value = "";
      if (value === targetValue && !remarkRef.current.disabled) {
        remarkRef.current.focus();
      }
    }
  }, [targetValue, value]);

  return (
    <Grid item xs={hasRemark && 12}>
      <Grid container alignItems="center">
        <Grid item flex={1}>
          <FormControlLabel
            value={value || ""}
            label={label || "Undefined"}
            name={name}
            control={
              <Radio
                onClick={() => {
                  if (handleRequired) handleRequired(undefined);
                  if (handleChange) {
                    handleChange(name, undefined);
                  }
                }}
                required={required}
              />
            }
            {...other}
          />
        </Grid>
        {hasRemark && (
          <Grid item flex={2}>
            <TextField
              label={wordLibrary?.remark ?? "備註"}
              size="small"
              placeholder={wordLibrary?.["enter remarks"] ?? "輸入備註"}
              value={remarkValue}
              onChange={(e) => {
                setRemarkValue(e.target.value);
              }}
              onBlur={(e) => {
                if (handleRemarkChange) {
                  handleRemarkChange(name, e.target.value);
                }
              }}
              required={
                requiredRemark && !!value && targetValue?.includes(value)
              }
              fullWidth
              disabled={!(!!value && targetValue?.includes(value))}
              error={
                requiredRemark &&
                !!value &&
                targetValue?.includes(value) &&
                !!remarkError &&
                !remarkValue
              }
              InputProps={{
                inputRef: remarkRef,
              }}
              id={id}
              data-tid={id}
            />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default React.memo(DynamicFormControlRadio);
