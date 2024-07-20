import React from "react";
import TextField, { TextFieldProps } from "@eGroupAI/material/TextField";
import MenuItem from "components/MenuItem";

export interface SelectShareWayStepProps {
  onChange?: TextFieldProps["onChange"];
  value?: TextFieldProps["value"];
}

const SelectShareWayStep = (props: SelectShareWayStepProps) => {
  const { onChange, value } = props;
  return (
    <TextField
      label="選擇分享方式"
      fullWidth
      select
      onChange={onChange}
      value={value}
    >
      <MenuItem value="organization">歷史分享單位</MenuItem>
      <MenuItem value="email">填寫單位Email</MenuItem>
    </TextField>
  );
};

export default SelectShareWayStep;
