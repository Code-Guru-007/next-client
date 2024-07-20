import React, { useCallback, useEffect, useMemo, useState } from "react";

import useOrgUserShareFilterSearch from "utils/useOrgUserShareFilterSearch";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { TableRowProps } from "@eGroupAI/material/TableRow";

import Paper from "@eGroupAI/material/Paper";
import I18nDataTable from "components/I18nDataTable";
import { Table } from "interfaces/utils";
import { OrganizationUserShare } from "interfaces/entities";
import { useRouter } from "next/router";
import SelectSharedOrganizationDialog, {
  DIALOG,
} from "./SelectSharedOrganizationDialog";
import ConfirmDeleteShareDialog from "./ConfirmDeleteShareDialog";
import useDeleteShareUsers from "./useDeleteShareUsers";

function CrmUserShareDataTable() {
  const organizationId = useSelector(getSelectedOrgId);
  const router = useRouter();

  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationUserShare & {
        TableRowProps: TableRowProps;
      }
    >
  >({});
  const [checkedAll, setCheckedAll] = useState(false);

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
    `CrmUserSharesDataTable-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const {
    columns,
    filterConditionGroups,
    isFilterConditionGroupsValidating,
    filterSearch,
    handleFilterSubmit,
    handleFilterClear,
  } = useDataTableFilterColumns(
    Table.USER_SHARES,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const { data, isValidating, mutate } = useOrgUserShareFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    undefined,
    undefined,
    !filterSearch
  );

  const { openDialog: openSharedOrgDialog } = useReduxDialog(DIALOG);

  useEffect(() => {
    if (router.query.organizationVerifyTokenId) {
      openSharedOrgDialog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedUserShares = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as OrganizationUserShare;
        }),
    [eachRowState]
  );

  const excludedTargetIdList = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => !el?.checked)
        .map((el) => el?.data?.organizationUserId as string),
    [eachRowState]
  );

  const tableData = useMemo(
    () =>
      !data
        ? []
        : data.source.map((el) => ({
            ...el,
            TableRowProps: {
              hover: true,
              sx: { cursor: "pointer" },
              onClick: (e) => {
                e.stopPropagation();
                window.open(
                  `/me/crm/users/${el.organizationUserId}/shared/${el.organization.organizationId}?tab=CRM_USER_INFO`,
                  "_blank"
                );
              },
              DataTableRowCheckboxProps: {
                onClick: (e) => {
                  e.stopPropagation();
                },
              },
            },
          })),
    [data]
  );

  const { handleSelectedDeleteOrgId, isShareDeleting, selectedDeleteOrgId } =
    useDeleteShareUsers({
      organizationId,
      checkedAll,
      filterSearch,
      mutate,
      targetIdList: selectedUserShares.map((el) => el.organizationUserId),
      excludedTargetIdList,
    });

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <>
      <SelectSharedOrganizationDialog
        organizationVerifyTokenId={router.query.organizationVerifyTokenId}
        onSave={() => {
          mutate();
        }}
      />
      <ConfirmDeleteShareDialog
        onChange={handleSelectedDeleteOrgId}
        value={selectedDeleteOrgId}
        loading={isShareDeleting}
      />
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="organizationUserId"
          data={tableData}
          enableRowCheckbox
          onEachRowStateChange={(state) => {
            setEachRowState(state);
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
          onCheckedAllClick={handleCheckedAllClick}
          onCheckedAllClearClick={handleCheckedAllClearClick}
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
    </>
  );
}

export default CrmUserShareDataTable;
