import React from "react";
import { useSelector } from "react-redux";

import Stack from "@mui/material/Stack";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const NoDataEditor = function () {
  const wordLibrary = useSelector(getWordLibrary);
  return (
    <Stack
      display="flex"
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: "300px" }}
    >
      {wordLibrary?.["no data found"] ?? "找不到資料"}
    </Stack>
  );
};

export default NoDataEditor;
