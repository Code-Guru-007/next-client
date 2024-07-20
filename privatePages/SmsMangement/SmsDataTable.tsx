import React, { FC } from "react";

import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import Paper from "@eGroupAI/material/Paper";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

import I18nDataTable from "components/I18nDataTable";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import { Table } from "interfaces/utils";
import { OrganizationSms } from "interfaces/entities";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import useOrgSmsFilterSearch from "utils/useOrgSmsFilterSearch";

import SmsManageDataTableRow from "components/SmsManageDataTableRow";

interface SmsDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  organizationId: string;
}

const SmsDataTable: FC<Props> = function (props) {
  const { organizationId } = props;

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    handleFilterValuesChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,

    payload,
    setPayload,
    submitedPayload,
    setSubmitedPayload,
    page,
    rowsPerPage,
  } = useDataTable<SmsDefaultPayload>(
    `SMSDataTable-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const {
    filterSearch,
    filterConditionGroups,
    isFilterConditionGroupsValidating,
    handleFilterSubmit,
    handleFilterClear,
  } = useDataTableFilterColumns(
    Table.SMS,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const wordLibrary = useSelector(getWordLibrary);

  const { data, isValidating } = useOrgSmsFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    undefined,
    undefined,
    !filterSearch
  );

  const columns = [
    {
      id: "organizationSmsSubject",
      name: `${wordLibrary?.subject ?? "主旨"}`,
      dataKey: "organizationSmsSubject",
      sortkey: "organizationSmsSubject",
    },
    {
      id: "organizationSmsContent",
      name: `${wordLibrary?.content ?? "內容"}`,
      dataKey: "organizationSmsContent",
      sortkey: "organizationSmsContent",
    },
    {
      id: "organizationSmsphone",
      name: `${wordLibrary?.phone ?? "電話"}`,
      dataKey: "organizationSmsphone",
      sortkey: "organizationSmsphone",
    },
    {
      id: "organizationSmsCreator",
      name: `${wordLibrary?.creator ?? "建立者"}`,
      dataKey: "organizationSmsCreator",
      sortkey: "organizationSmsCreator",
    },
    {
      id: "organizationSmsSendDate",
      name: `${wordLibrary?.["send date"] ?? "發送日期"}`,
      dataKey: "organizationSmsSendDate",
      sortkey: "organizationSmsSendDate",
    },
    {
      id: "organizationSmsSendStatusMessage",
      name: `${wordLibrary?.["sms send status message"] ?? "簡訊發送狀態"}`,
      dataKey: "organizationSmsSendStatusMessage",
      sortkey: "organizationSmsSendStatusMessage",
    },
  ];

  return (
    <div>
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="organizationSmsId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData) => {
            const row = rowData as OrganizationSms;

            return (
              <SmsManageDataTableRow
                row={row}
                key={row.organizationSmsId}
                handleClick={(e) => {
                  e.stopPropagation();
                }}
                columns={columns}
              />
            );
          }}
          isEmpty={data?.total === 0}
          serverSide
          loading={
            isValidating || isFilterConditionGroupsValidating || !filterSearch
          }
          MuiTablePaginationProps={{
            count: data?.total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          enableFilter
          filterConditionGroups={filterConditionGroups}
          onFilterValuesChange={handleFilterValuesChange}
          onFilterValuesSubmit={handleFilterValuesSubmit}
          onFilterValuesClear={handleFilterValuesClear}
          filterValues={payload.filterValues}
          onSortLabelClick={(sortKey, order) => {
            setPayload((p) => ({
              ...p,
              sort: {
                sortKey,
                order: order.toUpperCase(),
              },
            }));
          }}
          FilterDropDownProps={{
            onSubmit: handleFilterSubmit,
            onClear: handleFilterClear,
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

export default SmsDataTable;
