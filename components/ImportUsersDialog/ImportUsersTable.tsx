import React from "react";

import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import {
  getTotalUsers,
  getErrorUsers,
} from "redux/importUsersDialog/selectors";
import { Table } from "interfaces/utils";

import Typography from "@eGroupAI/material/Typography";
import TableCell from "@eGroupAI/material/TableCell";
import I18nDataTable from "components/I18nDataTable";
import { OrganizationUser } from "interfaces/entities";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const ImportUsersTable = function () {
  const wordLibrary = getWordLibrary;
  const {
    handleChangePage,
    handleRowsPerPageChange,
    page,
    rowsPerPage,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload,
  } = useDataTable(
    "ImportUsersDataTable",
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const organizationId = useSelector(getSelectedOrgId);
  const totalUsers = useSelector(getTotalUsers);
  const errorUsers = useSelector(getErrorUsers);
  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_USER",
    }
  );
  const { columns } = useDataTableFilterColumns(
    Table.USERS,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const dynamicColumns =
    orgColumns?.source.map((el) => ({
      id: el.columnId,
      name: wordLibrary?.[el.columnName] ?? el.columnName,
      render: (orgUser: OrganizationUser) => (
        <TableCell key={el.columnId}>
          {
            orgUser.dynamicColumnTargetList?.find(
              (d) => d.organizationColumn.columnId === el.columnId
            )?.columnTargetValue
          }
        </TableCell>
      ),
    })) || [];

  return (
    <>
      <Typography variant="h6" color="error" align="center">
        成功 : {totalUsers.length - errorUsers.length} 筆，失敗 :{" "}
        {errorUsers.length} 筆，共計 {totalUsers.length} 筆
      </Typography>
      <I18nDataTable
        rowKey="organizationUserId"
        enableRowCollapse
        minWidth={1920}
        sx={{ whiteSpace: "nowrap" }}
        columns={[
          {
            id: "importStatus",
            name: "匯入狀態",
            render: (data) => {
              if (data.importStatus === "FORMAT_ERROR") {
                return (
                  <TableCell key="importStatus">
                    <Typography color="error">
                      匯入格式錯誤
                      <br />
                      {data.importStatusMessage}
                    </Typography>
                  </TableCell>
                );
              }
              return (
                <TableCell key="importStatus">
                  <Typography color="success">匯入格式正確</Typography>
                </TableCell>
              );
            },
          },
          ...columns,
          ...dynamicColumns,
        ]}
        data={errorUsers}
        MuiTablePaginationProps={{
          count: errorUsers.length,
          page,
          rowsPerPage,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleRowsPerPageChange,
        }}
      />
    </>
  );
};

export default ImportUsersTable;
