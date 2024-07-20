import React, { FC, useState, useMemo, useCallback } from "react";

import { useSelector } from "react-redux";
import Paper from "@eGroupAI/material/Paper";

import Tooltip from "@eGroupAI/material/Tooltip";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import {
  useDataTable,
  EachRowState,
} from "@eGroupAI/material-module/DataTable";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import I18nDataTable from "components/I18nDataTable";
import PermissionValid from "components/PermissionValid";
import DynamicColumnTableRow from "components/DynamicColumnTableRow";
import { DIALOG as DELTE_CONFIRM } from "components/ConfirmDeleteDialog";
import { Table, ServiceModuleValue } from "interfaces/utils";
import { OrganizationColumn } from "interfaces/entities";

import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import useOrgDynamicColumnsFilterSearch from "utils/useOrgDynamicColumnsFilterSearch";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { Button, IconButton, ToggleButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";

interface Props {
  organizationId: string;
  onCreateColumn?: () => void;
  onEditColumn?: (row: OrganizationColumn) => void;
  onCopyColumn?: (row: OrganizationColumn) => void;
  onSortColumn?: () => void;
  columnTable: string;
  serviceModuleValue: ServiceModuleValue;
}

const DynamicColumnDataTable: FC<Props> = function (props) {
  const {
    organizationId,
    onCreateColumn,
    onEditColumn,
    onSortColumn,
    onCopyColumn,
    columnTable,
    serviceModuleValue,
  } = props;
  const [checkedAll, setCheckedAll] = useState(false);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<OrganizationColumn>
  >({});
  const wordLibrary = useSelector(getWordLibrary);
  const { excute: deleteBatchColumn } = useAxiosApiWrapper(
    apis.org.deleteBatchColumn,
    "Delete"
  );
  const { excute: deleteColumnByFilter, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.org.deleteColumnByFilter, "Delete");
  const {
    openDialog: openDeleteConfirmDialog,
    closeDialog: closeDeleteConfirmDialog,
    setDialogStates: setConfirmDeleteDialogStates,
  } = useReduxDialog(DELTE_CONFIRM);

  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

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
    `DynamicColumnsDataTable-${serviceModuleValue}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const {
    columns,
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

  const { data, isValidating, mutate } = useOrgDynamicColumnsFilterSearch(
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

  const selectedColumns = useMemo(() => {
    const checkedRows = Object.values(eachRowState).filter((el) => el?.checked);
    if (checkedRows.length === 0) {
      return [];
    }
    return checkedRows.reduce<OrganizationColumn[]>((a, b) => {
      if (!b) return a;
      if (b.checked) {
        return [...a, b.data as OrganizationColumn];
      }
      return a;
    }, []);
  }, [eachRowState]);

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const handleDeleteDynamicColumn = () => {
    openDeleteConfirmDialog({
      primary: "您確定要刪除此欄位嗎？",
      isDeleting,
      onConfirm: async () => {
        if (selectedColumns) {
          setConfirmDeleteDialogStates({ isDeleting: true });
          const targetIdList = selectedColumns.map(
            (selectedColumn) => selectedColumn.columnId
          );
          if (checkedAll)
            await deleteColumnByFilter({
              organizationId,
              columnTable,
              filterObject: filterSearch,
            });
          else
            await deleteBatchColumn({
              organizationId,
              targetIdList,
            });
          setDeleteState(true);
          mutate();
          closeDeleteConfirmDialog();
          openSnackbar({
            message: wordLibrary?.["deletion successful"] ?? "刪除成功",
            severity: "success",
            autoHideDuration: 4000,
          });
        }
      },
    });
  };

  const buttonTools = (
    <PermissionValid
      shouldBeOrgOwner
      modulePermissions={["CREATE"]}
      targetPath="/me/dynamic-columns"
    >
      <Button
        onClick={onCreateColumn}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        id="table-add-button"
        data-tid="table-add-button"
      >
        {wordLibrary?.add ?? "新增"}
      </Button>
    </PermissionValid>
  );

  const iconTools = (
    <>
      <PermissionValid
        shouldBeOrgOwner
        modulePermissions={["UPDATE_ALL"]}
        targetPath="/me/dynamic-columns"
      >
        <ToggleButton value="waterfalls" onClick={onSortColumn}>
          <Tooltip title="排序">
            <Iconify icon="iconoir:sort" />
          </Tooltip>
        </ToggleButton>
      </PermissionValid>
    </>
  );

  const selectedToolsbar = (
    <>
      {selectedColumns.length === 1 && (
        <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
          <Tooltip title={wordLibrary?.copy ?? "複製"}>
            <IconButton
              onClick={() => {
                if (onCopyColumn && selectedColumns[0])
                  onCopyColumn(selectedColumns[0]);
              }}
              color="primary"
            >
              <Iconify icon="ic:twotone-content-copy" width={24} />
            </IconButton>
          </Tooltip>
        </PermissionValid>
      )}
      {selectedColumns.length >= 1 && (
        <PermissionValid shouldBeOrgOwner modulePermissions={["DELETE_ALL"]}>
          <Tooltip title={wordLibrary?.delete ?? "刪除"}>
            <IconButton onClick={handleDeleteDynamicColumn} color="primary">
              <Iconify icon="solar:trash-bin-trash-bold" width={24} />
            </IconButton>
          </Tooltip>
        </PermissionValid>
      )}
    </>
  );

  return (
    <>
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="columnId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData) => {
            const row = rowData as OrganizationColumn;

            return (
              <DynamicColumnTableRow
                columns={columns}
                row={row}
                key={row.columnId}
                onClick={() => {
                  if (onEditColumn) onEditColumn(row);
                }}
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
          enableRowCheckbox
          buttonTools={buttonTools}
          iconTools={iconTools}
          selectedToolsbar={selectedToolsbar}
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
          onEachRowStateChange={(state) => {
            setEachRowState(state);
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
          deleteState={deleteState}
          setDeleteState={setDeleteState}
        />
      </Paper>
    </>
  );
};

export default DynamicColumnDataTable;
