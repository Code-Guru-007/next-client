import React from "react";

import TextField, { TextFieldProps } from "@eGroupAI/material/TextField";
import MenuItem from "components/MenuItem";

export interface SelectShareInfoStepProps {
  variant?: "organization" | "email";
  onChange?: TextFieldProps["onChange"];
  value?: TextFieldProps["value"];
  emailFormatError?: boolean;
  sharerOrgs:
    | {
        organizationId: string;
        organizationName: string;
      }[]
    | undefined;
}

const SelectShareInfoStep = (props: SelectShareInfoStepProps) => {
  const {
    variant = "organization",
    onChange,
    value,
    emailFormatError,
    sharerOrgs,
  } = props;

  if (variant === "organization") {
    return (
      <TextField
        label="歷史分享單位"
        fullWidth
        select
        onChange={onChange}
        value={value}
      >
        {sharerOrgs?.map((el) => (
          <MenuItem key={el.organizationId} value={el.organizationId}>
            {el.organizationName}
          </MenuItem>
        ))}
      </TextField>
    );
  }
  return (
    <TextField
      label="Email"
      fullWidth
      onChange={onChange}
      value={value}
      error={emailFormatError}
      helperText={emailFormatError && "Email 格式錯誤"}
    />
  );
};

export default SelectShareInfoStep;
