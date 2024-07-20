import React, { useCallback, useMemo, useState } from "react";

import PermissionValid from "components/PermissionValid";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgGroupTableFilterSearch from "utils/useOrgGroupTableFilterSearch";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { TableRowProps } from "@eGroupAI/material/TableRow";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import Paper from "@eGroupAI/material/Paper";
import Tooltip from "@eGroupAI/material/Tooltip";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

import I18nDataTable from "components/I18nDataTable";

import { ServiceModuleValue, Table } from "interfaces/utils";
import { OrganizationGroup } from "interfaces/entities";

import {
  TagAddDialog,
  TAG_ADD_DIALOG,
  TagDeleteDialog,
  TAG_DELETE_DIALOG,
} from "components/DatatableToolDialogs";
import { Button, IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

import OrgGroupDialog, { DIALOG as GROUP_DIALOG } from "./OrgGroupDialog";

function OrgGroupDataTable() {
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const { openDialog: openOrgGroupDialog, closeDialog: closeOrgGroupDialog } =
    useReduxDialog(GROUP_DIALOG);

  const { openDialog: openTagDialog } = useReduxDialog(
    `${ServiceModuleValue.ORGANIZATION_GROUP}_${TAG_ADD_DIALOG}`
  );
  const { openDialog: openTagDeleteDialog } = useReduxDialog(
    `${ServiceModuleValue.ORGANIZATION_GROUP}_${TAG_DELETE_DIALOG}`
  );

  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationGroup & {
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
    handleSelectFilterView,
    payload,
    setPayload,
    submitedPayload,
    setSubmitedPayload,

    page,
    rowsPerPage,
  } = useDataTable(
    `OrgGroupsDataTable-${organizationId}`,
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
    Table.ORGANIZATION_GROUP,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const { data, isValidating, mutate } = useOrgGroupTableFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    undefined,
    undefined,
    !filterSearch
  );

  const { excute: createOrgGroup, isLoading: isCreating } = useAxiosApiWrapper(
    apis.org.createOrgGroup,
    "Create"
  );

  const selectedGroup = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as OrganizationGroup;
        }),
    [eachRowState]
  );

  const excludedTargetIdList = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => !el?.checked)
        .map((el) => el?.data?.organizationGroupId as string),
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
                  `/me/org-group/${el.organizationGroupId}`,
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

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <Button
        onClick={openOrgGroupDialog}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        {wordLibrary?.add ?? "新增"}
      </Button>
    </PermissionValid>
  );

  const selectedToolsbar = useMemo(
    () => (
      <>
        {selectedGroup.length !== 0 && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
            <Tooltip title={wordLibrary?.["batch tagging"] ?? "批次標註"}>
              <div role="button" tabIndex={-1}>
                <IconButton
                  onClick={() => {
                    openTagDialog();
                  }}
                  disabled={
                    (!checkedAll && selectedGroup.length === 0) ||
                    (checkedAll && data?.total === excludedTargetIdList.length)
                  }
                  color="primary"
                >
                  <Iconify icon="ic:round-local-offer" width={24} />
                </IconButton>
              </div>
            </Tooltip>
          </PermissionValid>
        )}
        {(checkedAll || selectedGroup.length !== 0) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["DELETE_ALL"]}>
            <Tooltip
              title={wordLibrary?.["batch tagging delete"] ?? "批次標註刪除"}
            >
              <div role="button" tabIndex={-1}>
                <IconButton
                  onClick={() => {
                    openTagDeleteDialog();
                  }}
                  disabled={
                    (!checkedAll && selectedGroup.length === 0) ||
                    (checkedAll && data?.total === excludedTargetIdList.length)
                  }
                  color="primary"
                >
                  <Iconify icon="mdi:tag-off" width={24} />
                </IconButton>
              </div>
            </Tooltip>
          </PermissionValid>
        )}
      </>
    ),
    [
      checkedAll,
      data?.total,
      excludedTargetIdList.length,
      openTagDeleteDialog,
      openTagDialog,
      selectedGroup.length,
      wordLibrary,
    ]
  );

  return (
    <>
      <OrgGroupDialog
        onConfirm={(p) => {
          createOrgGroup({
            organizationId,
            ...p,
          })
            .then(() => {
              mutate();
              closeOrgGroupDialog();
            })
            .catch(() => {});
        }}
        loading={isCreating}
      />
      {filterSearch && (
        <TagAddDialog
          filterSearch={filterSearch}
          tableModule={Table.ORGANIZATION_GROUP}
          serviceModuleValue={ServiceModuleValue.ORGANIZATION_GROUP}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedGroup.map((el) => el.organizationGroupId)}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            mutate();
          }}
        />
      )}
      {filterSearch && (
        <TagDeleteDialog
          filterSearch={filterSearch}
          tableModule={Table.ORGANIZATION_GROUP}
          serviceModuleValue={ServiceModuleValue.ORGANIZATION_GROUP}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedGroup.map((el) => el.organizationGroupId)}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            setDeleteState(true);
            mutate();
          }}
        />
      )}
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="organizationGroupId"
          data={tableData}
          sx={{
            "&.MuiEgDataTable-table .MuiTableCell-root": {
              padding: "16px 8px",
            },
          }}
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
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
          payload={payload}
          serviceModuleValue={ServiceModuleValue.ORGANIZATION_GROUP}
          onFilterViewSelect={handleSelectFilterView}
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
          deleteState={deleteState}
          setDeleteState={setDeleteState}
        />
      </Paper>
    </>
  );
}

export default OrgGroupDataTable;
