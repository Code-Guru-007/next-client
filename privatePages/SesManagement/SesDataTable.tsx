import React, { FC } from "react";

import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import Paper from "@eGroupAI/material/Paper";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import I18nDataTable from "components/I18nDataTable";
import SesManageDataTableRow from "components/SesManageDataTableRow";
import { Table } from "interfaces/utils";
import { OrganizationSes } from "interfaces/entities";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import useOrgSesFilterSearch from "utils/useOrgSesFilterSearch";

interface SesDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  organizationId: string;
}

const SesDataTable: FC<Props> = function (props) {
  const { organizationId } = props;

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,

    payload,
    setPayload,
    submitedPayload,
    setSubmitedPayload,
    page,
    rowsPerPage,
  } = useDataTable<SesDefaultPayload>(
    `SESDataTable-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const { filterSearch } = useDataTableFilterColumns(
    Table.SES,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const { data, isValidating } = useOrgSesFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    undefined,
    undefined,
    !filterSearch
  );

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <div>
      <Paper>
        <I18nDataTable
          columns={[
            {
              id: "organizationSesSubject",
              name: wordLibrary?.subject ?? "主旨",
              dataKey: "organizationSesSubject",
              sortKey: "organizationSesSubject",
            },
            {
              id: "organizationSesContent",
              name: wordLibrary?.content ?? "內容",
              dataKey: "organizationSesContent",
              sortKey: "organizationSesContent",
            },
            {
              id: "organizationSesEmail",
              name: wordLibrary?.["electronic mail"] ?? "電子郵件",
              dataKey: "organizationSesEmail",
              sortKey: "organizationSesEmail",
            },
            {
              id: "organizationSesSendDateToString",
              name: wordLibrary?.["send date"] ?? "發送日期",
              dataKey: "organizationSesSendDate",
              sortKey: "organizationSesSendDate",
            },
          ]}
          rowKey="organizationSesId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData) => {
            const row = rowData as OrganizationSes;

            return (
              <SesManageDataTableRow
                row={row}
                key={row.organizationSesId}
                handleClick={(e) => {
                  e.stopPropagation();
                }}
              />
            );
          }}
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
          onSortLabelClick={(sortKey, order) => {
            setPayload((p) => ({
              ...p,
              sort: {
                sortKey,
                order: order.toUpperCase(),
              },
            }));
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
    </div>
  );
};

export default SesDataTable;
