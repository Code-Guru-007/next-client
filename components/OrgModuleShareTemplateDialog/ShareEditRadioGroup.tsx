import React, { FC } from "react";
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@eGroupAI/material";

export interface ShareEditRadioGroupProps {
  label: string;
  value: string;
  name?: string;
  handleChange: (value: string) => void;
}

const options = [
  { label: "是", value: "1" },
  { label: "否", value: "0" },
];

const ShareEditRadioGroup: FC<ShareEditRadioGroupProps> = (props) => {
  const { label, value, handleChange } = props;

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <RadioGroup
        row
        value={value}
        onChange={(e) => {
          handleChange(e.target.value);
        }}
      >
        {options.map((o) => (
          <FormControlLabel
            key={o.value}
            control={<Radio />}
            value={o.value}
            label={o.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default React.memo(ShareEditRadioGroup, (prev, next) => {
  if (prev.value === next.value) return true;
  return false;
});
