import React, { FC, useState, useMemo, useEffect } from "react";

import Paper from "@eGroupAI/material/Paper";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import {
  useDataTable,
  EachRowState,
  TableEvent,
} from "@eGroupAI/material-module/DataTable";
import TableCell from "@eGroupAI/material/TableCell";
import Typography from "@eGroupAI/material/Typography";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import I18nDataTable from "components/I18nDataTable";
import { Table, ColumnTypeMap } from "interfaces/utils";
import { OrganizationColumn } from "interfaces/entities";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import useOrgDynamicColumnsFilterSearch from "utils/useOrgDynamicColumnsFilterSearch";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import { FilterSearch } from "@eGroupAI/typings/apis";

export interface DynamicColumnMiniTableProps {
  organizationId: string;
  onChangeSelectedColumns?: (values: string[]) => void;
  defaultCheckedRowIds?: string[];
  onEachRowStateChange?: (
    eachRowState: EachRowState<OrganizationColumn>,
    tableEvent?: TableEvent
  ) => void;
  onSetCheckedAll?: (checked: boolean, filterSearch?: FilterSearch) => void;
  columnTable: string;
}

const DynamicColumnMiniTable: FC<DynamicColumnMiniTableProps> = function (
  props
) {
  const wordLibrary = useSelector(getWordLibrary);

  const {
    organizationId,
    onChangeSelectedColumns,
    defaultCheckedRowIds,
    onEachRowStateChange: onEachRowStateChangeProp,
    onSetCheckedAll,
    columnTable,
  } = props;
  const [eachRowState, setEachRowState] = useState<
    EachRowState<OrganizationColumn>
  >({});

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
  } = useDataTable(
    `DynamicColumnsMiniDataTable-${columnTable}`,
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
    Table.COLUMNS,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const { data: wholeData } = useOrgDynamicColumns({
    organizationId,
  });

  const { data, isValidating } = useOrgDynamicColumnsFilterSearch(
    {
      organizationId,
    },
    {
      ...filterSearch,
    },
    {
      columnTable,
    },
    undefined,
    !filterSearch
  );

  const handleClickAllCheck = () => {
    if (onSetCheckedAll) onSetCheckedAll(true, filterSearch);
  };

  const handleClickAllUnCheck = () => {
    if (onSetCheckedAll) onSetCheckedAll(false, filterSearch);
  };

  const selectedColumnIds = useMemo(
    () => Object.keys(eachRowState).filter((k) => eachRowState[k]?.checked),
    [eachRowState]
  );

  useEffect(() => {
    if (onChangeSelectedColumns) {
      onChangeSelectedColumns(selectedColumnIds);
    }
  }, [onChangeSelectedColumns, selectedColumnIds]);

  const columns = [
    {
      id: "1",
      name: `${wordLibrary?.["field name"] ?? "欄位名稱"}`,
      sortKey: "columnName",
      dataKey: "columnName",
    },
    {
      id: "2",
      name: "欄位類型",
      sortKey: "columnType",
      dataKey: "columnType",
      render: (data) => (
        <TableCell key="importStatus">
          <Typography>
            {wordLibrary?.[ColumnTypeMap[data.columnType]] ??
              ColumnTypeMap[data.columnType]}
          </Typography>
        </TableCell>
      ),
    },
  ];

  const defaultEachRowState = useMemo(
    () =>
      defaultCheckedRowIds?.reduce<EachRowState<OrganizationColumn>>(
        (a, b) => ({
          ...a,
          [b]: {
            checked: true,
            display: false,
            data: wholeData?.source.find(({ columnId }) => b === columnId),
          },
        }),
        {}
      ),
    [defaultCheckedRowIds, wholeData?.source]
  );

  return (
    <>
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="columnId"
          data={!data ? [] : data?.source}
          defaultEachRowState={defaultEachRowState}
          enableRowCheckbox
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
          onCheckedAllClick={handleClickAllCheck}
          onCheckedAllClearClick={handleClickAllUnCheck}
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
          onEachRowStateChange={(state) => {
            setEachRowState(state);
            if (onEachRowStateChangeProp) onEachRowStateChangeProp(state);
          }}
          searchBar={
            <SearchBar
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

export default DynamicColumnMiniTable;
