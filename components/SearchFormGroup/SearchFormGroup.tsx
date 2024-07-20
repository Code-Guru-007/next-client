import React, { FC } from "react";
import { makeStyles } from "@mui/styles";

import InputAdornment from "@eGroupAI/material/InputAdornment";
import { TextFieldProps } from "@eGroupAI/material";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";

export interface SearchFormGroupProps {
  value?: string;
  onChange?: TextFieldProps["onChange"];
  fullWidth?: boolean;
}

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "center",
    width: (props: SearchFormGroupProps) =>
      props.fullWidth ? "100%" : undefined,
  },
}));

const SearchFormGroup: FC<SearchFormGroupProps> = function (props) {
  const { value, onChange, fullWidth } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles(props);

  return (
    <div className={classes.root}>
      <TextField
        fullWidth={fullWidth}
        variant="outlined"
        placeholder={`${wordLibrary?.search ?? "搜尋"}......`}
        type="text"
        value={value}
        onChange={(e) => {
          if (onChange) {
            onChange(e);
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

export default SearchFormGroup;
