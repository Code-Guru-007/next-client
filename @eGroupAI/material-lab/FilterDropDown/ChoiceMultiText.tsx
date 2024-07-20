import React, { FC, useState, useRef, useEffect } from "react";
import { TextField, Autocomplete } from "@mui/material";
import Typography from "@eGroupAI/material/Typography";
import StyledPopper from "./StyledPopper";
import { Item, Value } from "./types";

interface ChoiceMultiTextProps {
  className?: string;
  items?: Item[];
  name?: string;
  defaultValue?: Item[];
  isClearAutoComplete?: boolean;
  onClearAutoComplete?: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterOptionsTempValue?: React.Dispatch<React.SetStateAction<Value>>;
}

const ChoiceMultiText: FC<ChoiceMultiTextProps> = (props) => {
  const {
    className,
    items,
    name,
    defaultValue,
    isClearAutoComplete,
    onClearAutoComplete,
    setFilterOptionsTempValue,
  } = props;
  const [values, setValues] = useState<Item[] | undefined>(defaultValue);

  const textEle = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textEle.current) {
      textEle.current.value = JSON.stringify(values);
    }
  }, [values]);

  useEffect(() => {
    if (isClearAutoComplete) {
      setValues([]);
      if (onClearAutoComplete) onClearAutoComplete(false);
    }
  }, [isClearAutoComplete, onClearAutoComplete]);

  if (!items) {
    return <Typography>查無選項資料</Typography>;
  }

  return (
    <div className={className}>
      <Autocomplete
        options={items}
        multiple
        disableCloseOnSelect
        PopperComponent={StyledPopper}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        value={values}
        getOptionLabel={(option) => option.label || ""}
        noOptionsText="查無選項資料"
        renderInput={(params) => (
          <TextField variant="outlined" {...params} fullWidth size="small" />
        )}
        onChange={(e, v) => {
          setValues(v);
          if (setFilterOptionsTempValue)
            setFilterOptionsTempValue((prev) => ({
              ...prev,
              [name as string]: v,
            }));
        }}
        id={`choiceMulti-text-input-${name as string}`}
      />
      <input
        ref={textEle}
        name={name}
        style={{ display: "none" }}
        id={`choice-multi-text-input-${name as string}`}
        data-tid={`choice-multi-text-input-${name as string}`}
      />
    </div>
  );
};

export default ChoiceMultiText;
