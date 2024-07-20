import React, { FC } from "react";
import { TextField, Grid } from "@eGroupAI/material";

export interface OrgShareEditTextProps {
  name?: string;
  label?: string;
  value: string;
  handleChange: (value: string) => void;
  handleBlur: (value: string) => void;
}

const OrgShareEditUploadDescription: FC<OrgShareEditTextProps> = (props) => {
  const { label, value, handleChange, handleBlur } = props;

  return (
    <Grid item xs={12}>
      <TextField
        label={label || ""}
        fullWidth
        value={value}
        multiline
        minRows={4}
        onChange={(e) => {
          handleChange(e.target.value);
        }}
        onBlur={() => handleBlur(value)}
      />
    </Grid>
  );
};

export default React.memo(OrgShareEditUploadDescription, (prev, next) => {
  if (prev.value === next.value) return true;
  return false;
});
