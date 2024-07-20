import React, { useState } from "react";

import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgFeedbacks from "utils/useOrgFeedbacks";
import { format } from "@eGroupAI/utils/dateUtils";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import Paper from "@eGroupAI/material/Paper";
import TableCell from "@eGroupAI/material/TableCell";
import Button from "@eGroupAI/material/Button";
import I18nDataTable from "components/I18nDataTable";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { OrganizationFeedback } from "interfaces/entities";
import FeedbackDialog, { DIALOG } from "./FeedbackDialog";

const FeedbackDataTable = function () {
  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const { openDialog } = useReduxDialog(DIALOG);
  const [selectedFeedback, setSelectedFeedback] =
    useState<OrganizationFeedback>();
  const {
    handleChangePage,
    handleSearchChange,
    handleRowsPerPageChange,
    payload,

    page,
    rowsPerPage,
  } = useDataTable(
    "FeedbackDataTable",
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const { data, isValidating } = useOrgFeedbacks(
    {
      organizationId,
    },
    {
      locale,
      ...payload,
    }
  );

  return (
    <>
      <FeedbackDialog
        organizationFeedbackId={selectedFeedback?.organizationFeedbackId}
      />
      <Paper>
        <I18nDataTable
          rowKey="organizationFeedbackId"
          columns={[
            {
              id: "organizationTag",
              name: "回饋類型",
              dataKey: "organizationTag.tagName",
            },
            {
              id: "title",
              name: "回饋標題",
              dataKey: "organizationFeedbackTitle",
            },
            {
              id: "name",
              name: "回饋姓名",
              dataKey: "organizationFeedbackPersonName",
            },
            {
              id: "phone",
              name: "聯絡電話",
              dataKey: "organizationFeedbackPersonPhone",
            },
            {
              id: "email",
              name: "聯絡 Email",
              dataKey: "organizationFeedbackPersonEmail",
            },
            {
              id: "createDate",
              name: "新增日期",
              dataKey: "organizationFeedbackCreateDateString",
              format: (val) => format(val as string, "PP pp"),
            },
            {
              id: "action",
              name: "操作",
              align: "center",
              render: (feedback) => (
                <TableCell align="center" key="action">
                  <Button
                    onClick={() => {
                      setSelectedFeedback(feedback);
                      openDialog();
                    }}
                  >
                    查看
                  </Button>
                </TableCell>
              ),
            },
          ]}
          data={!data ? [] : data.source}
          isEmpty={data?.total === 0}
          serverSide
          loading={isValidating}
          MuiTablePaginationProps={{
            count: data?.total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          searchBar={
            <StyledSearchBar
              handleSearchChange={handleSearchChange}
              value={payload.query}
              placeholder={
                wordLibrary?.["search and press Enter"] ?? "搜尋並按Enter"
              }
            />
          }
        />
      </Paper>
    </>
  );
};

export default FeedbackDataTable;
