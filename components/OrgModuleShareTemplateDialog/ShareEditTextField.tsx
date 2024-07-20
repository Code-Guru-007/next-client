import React, { FC } from "react";
import { TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export interface OrgShareEditTextProps {
  name?: string;
  label?: string;
  value: string;
  multiline?: boolean;
  handleChange: (value: string) => void;
  handleBlur: (value: string) => void;
  placeholder?: string;
}

const OrgShareEditUploadDescription: FC<OrgShareEditTextProps> = (props) => {
  const {
    label,
    value,
    handleChange,
    handleBlur,
    multiline = true,
    placeholder: placeholderProp = "",
  } = props;

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <TextField
      label={label || ""}
      fullWidth
      value={value}
      multiline={multiline}
      minRows={4}
      onChange={(e) => {
        handleChange(e.target.value);
      }}
      onBlur={() => handleBlur(value)}
      placeholder={
        (placeholderProp || wordLibrary?.["share template name"]) ??
        "分享範本名稱"
      }
      required
      sx={{ margin: 0 }}
    />
  );
};

export default React.memo(OrgShareEditUploadDescription, (prev, next) => {
  if (prev.value === next.value) return true;
  return false;
});
