import React from "react";
import { useSelector } from "react-redux";
import StyledDataTable from "@eGroupAI/material-module/DataTable/DataTable";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const I18nDataTable = function (props) {
  const { MuiTablePaginationProps, ...other } = props;
  const wordLibrary = useSelector(getWordLibrary);
  return (
    <StyledDataTable
      MuiTablePaginationProps={{
        labelRowsPerPage: "每頁筆數",
        ...MuiTablePaginationProps,
      }}
      localization={{
        emptyMessage: wordLibrary?.["no information found"] ?? "查無資料",
        columnSelectBtn: wordLibrary?.["Field Filter"] ?? "欄位顯示",
      }}
      {...other}
    />
  );
};

export default I18nDataTable;
