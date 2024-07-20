import React, { FC, useState, useMemo } from "react";

import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
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
import DynamicColumnGroupTableRow from "components/DynamicColumnGroupTableRow";
import { DIALOG as DELETE_CONFIRM } from "components/ConfirmDeleteDialog";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { ColumnGroup } from "interfaces/entities";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import useOrgDynamicColumnGroupsFilterSearch from "utils/useOrgDynamicColumnGroupsFilterSearch";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { Button, IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

interface Props {
  organizationId: string;
  onCreateColumnGroup?: () => void;
  onEditColumnGroup?: (row: ColumnGroup) => void;
  serviceModuleValue: ServiceModuleValue;
}

const DynamicColumnGroupDataTable: FC<Props> = function (props) {
  const {
    organizationId,
    onCreateColumnGroup,
    onEditColumnGroup,
    serviceModuleValue,
  } = props;
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<EachRowState<ColumnGroup>>(
    {}
  );
  // const { tourId, steps } = useTutorialParams();
  const wordLibrary = useSelector(getWordLibrary);
  const { excute: deleteOrgDynamicColumnGroup, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.org.deleteOrgDynamicColumnGroup, "Delete");
  const {
    openDialog: openDeleteConfirmDialog,
    closeDialog: closeDeleteConfirmDialog,
    setDialogStates: setConfirmDeleteDialogStates,
  } = useReduxDialog(DELETE_CONFIRM);

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
    `DynamicColumnGroupsDataTable-${serviceModuleValue}`,
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
    Table.COLUMN_GROUPS,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const { data, isValidating, mutate } = useOrgDynamicColumnGroupsFilterSearch(
    {
      organizationId,
    },
    {
      ...filterSearch,
    },
    { serviceModuleValue },
    undefined,
    !filterSearch
  );

  const selectedGroups = useMemo(() => {
    const checkedRows = Object.values(eachRowState).filter((el) => el?.checked);
    if (checkedRows.length === 0) {
      return [];
    }
    return checkedRows.reduce<ColumnGroup[]>((a, b) => {
      if (!b) return a;
      if (b.checked) {
        return [...a, b.data as ColumnGroup];
      }
      return a;
    }, []);
  }, [eachRowState]);

  const handleDeleteColumnGroup = () => {
    openDeleteConfirmDialog({
      primary: `確定要刪除欄位群組?`,
      isDeleting,
      onConfirm: async () => {
        try {
          if (selectedGroups && selectedGroups[0]) {
            setConfirmDeleteDialogStates({ isDeleting: true });
            await deleteOrgDynamicColumnGroup({
              organizationId,
              columnGroupId: selectedGroups[0]?.columnGroupId,
            });
            setDeleteState(true);
            closeDeleteConfirmDialog();
            mutate();
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          apis.tools.createLog({
            function: "DynamicColumnGroupTable: handleDeleteColumnGroup",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
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
        onClick={onCreateColumnGroup}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        {wordLibrary?.add ?? "新增"}
      </Button>
    </PermissionValid>
  );

  const selectedToolsbar = (
    <>
      {selectedGroups.length === 1 && (
        <PermissionValid
          shouldBeOrgOwner
          modulePermissions={["DELETE_ALL"]}
          targetPath="/me/dynamic-columns"
        >
          <Tooltip title={wordLibrary?.delete ?? "刪除"}>
            <IconButton onClick={handleDeleteColumnGroup} color="primary">
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
          rowKey="columnGroupId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData) => {
            const row = rowData as ColumnGroup;

            return (
              <DynamicColumnGroupTableRow
                columns={columns}
                row={row}
                key={row.columnGroupId}
                onClick={() => {
                  if (onEditColumnGroup) {
                    onEditColumnGroup(row);
                  }
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
          selectedToolsbar={selectedToolsbar}
          filterConditionGroups={filterConditionGroups}
          onFilterValuesChange={handleFilterValuesChange}
          onFilterValuesSubmit={handleFilterValuesSubmit}
          onFilterValuesClear={handleFilterValuesClear}
          filterValues={payload.filterValues}
          serviceModuleValue={serviceModuleValue}
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

export default DynamicColumnGroupDataTable;
