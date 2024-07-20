import React, { FC, useState, useRef, useEffect } from "react";
import { TextField, Autocomplete } from "@eGroupAI/material";
import Typography from "@eGroupAI/material/Typography";
import StyledPopper from "./StyledPopper";
import { Item } from "./types";

interface ChoiceMultiDropdownProps {
  className?: string;
  items?: Item[];
  name?: string;
  defaulutValue?: Item[];
}

const ChoiceMultiDropdown: FC<ChoiceMultiDropdownProps> = (props) => {
  const { className, items, name, defaulutValue } = props;
  const [values, setValues] = useState<Item[] | undefined>(defaulutValue);
  const textEle = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textEle.current) {
      textEle.current.value = JSON.stringify(values);
    }
  }, [values]);

  if (!items) {
    return <Typography>查無選項資料</Typography>;
  }
  return (
    <div className={className}>
      <Autocomplete
        options={items}
        PopperComponent={StyledPopper}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        getOptionLabel={(option) => option.label || ""}
        noOptionsText="查無選項資料"
        renderInput={(params) => (
          <TextField variant="outlined" {...params} fullWidth size="small" />
        )}
        onChange={(e, v) => setValues([v as Item])}
      />

      <input ref={textEle} name={name} style={{ display: "none" }} />
    </div>
  );
};

export default ChoiceMultiDropdown;
