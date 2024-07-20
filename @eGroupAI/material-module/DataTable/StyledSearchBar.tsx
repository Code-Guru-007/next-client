import React, { FC, useState } from "react";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { InputBaseProps } from "@mui/material/InputBase";
import { InputAdornment, TextField, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Iconify from "minimal/components/iconify/iconify";

interface StyledInputBaseProps extends InputBaseProps {
  /**
   * handle change on searchBar
   */
  handleSearchChange?: (value: unknown) => void;
  /**
   * trigger search handler during typing, or hit Enter or Blur
   * @default false
   */
  triggerSearchOnTyping?: boolean;
}

const StyledSearchBar: FC<StyledInputBaseProps> = (props) => {
  const {
    value: valueProp = "",
    handleSearchChange,
    triggerSearchOnTyping = false,
  } = props;

  const wordLibrary = useSelector(getWordLibrary);
  const [value, setValue] = useState(valueProp);

  const handleOnBlur = () => {
    if (!triggerSearchOnTyping && handleSearchChange) handleSearchChange(value);
  };

  const handleInputChange = (e: { target: { value: unknown } }) => {
    setValue(e.target.value);
    if (triggerSearchOnTyping && handleSearchChange)
      handleSearchChange(e.target.value);
  };

  const handleKeyPress = (e: { key: string }) => {
    if (e.key === "Enter") {
      if (!triggerSearchOnTyping && handleSearchChange)
        handleSearchChange(value);
    }
  };

  const handleClose = () => {
    setValue("");
    if (handleSearchChange) handleSearchChange("");
  };

  return (
    <TextField
      value={value}
      onChange={handleInputChange}
      onKeyPress={handleKeyPress}
      placeholder={wordLibrary?.search ?? "搜尋"}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: "text.disabled" }} />
          </InputAdornment>
        ),
        endAdornment:
          value === "" ? undefined : (
            <InputAdornment position="end">
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ),
      }}
      size="small"
      sx={{
        width: { xs: 1, md: 320 },
      }}
      onBlur={handleOnBlur}
      id="table-search-input"
    />
  );
};

export default StyledSearchBar;
