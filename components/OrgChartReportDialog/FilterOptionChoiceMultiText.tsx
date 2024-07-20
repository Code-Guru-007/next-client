import React, { FC, useState, useRef, useEffect } from "react";
import { TextField, Autocomplete } from "@mui/material";
import Typography from "@eGroupAI/material/Typography";
import StyledPopper from "@eGroupAI/material-lab/FilterDropDown/StyledPopper";
import {
  Item,
  Value,
  ValueType,
} from "@eGroupAI/material-lab/FilterDropDown/types";

interface FilterOptionChoiceMultiTextProps {
  className?: string;
  items?: Item[];
  name?: string;
  defaultValue?: Item[];
  isClearAutoComplete?: boolean;
  onClearAutoComplete?: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterOptionsTempValue?: React.Dispatch<React.SetStateAction<Value>>;
  onChange?: (value: ValueType) => void;
}

const FilterOptionChoiceMultiText: FC<FilterOptionChoiceMultiTextProps> = (
  props
) => {
  const {
    className,
    items,
    name,
    defaultValue,
    isClearAutoComplete,
    onClearAutoComplete,
    setFilterOptionsTempValue,
    onChange: onChangeProp,
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
        getOptionLabel={(option) => option.label}
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
          if (onChangeProp) onChangeProp(v);
        }}
      />
      <input ref={textEle} name={name} style={{ display: "none" }} />
    </div>
  );
};

export default FilterOptionChoiceMultiText;
