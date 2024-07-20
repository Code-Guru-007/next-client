import React from "react";

import TextField from "@eGroupAI/material/TextField";

export interface OrgTextFieldProps {
  onChange: (
    initialVal: unknown,
    newVal: unknown,
    field: string
  ) => void | Promise<void>;
  value: unknown;
  field: string;
}

const OrgTextField = function (props: OrgTextFieldProps) {
  const { onChange, value, field } = props;

  const handleOnChangeWithAction = (fv) => onChange(value, fv, field);

  return (
    <TextField
      fullWidth
      enableAction
      onChangeWithAction={handleOnChangeWithAction}
      value={value}
      size="small"
      showHistoryIcon
    />
  );
};

export default OrgTextField;
