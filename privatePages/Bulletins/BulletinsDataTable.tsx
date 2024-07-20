/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import {
  useDataTable,
  EachRowState,
} from "@eGroupAI/material-module/DataTable";
import useBulletinTableFilterSearch from "utils/Bulletin/useBulletinTableFilterSearch";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import { TableRowProps } from "@eGroupAI/material/TableRow";
import Paper from "@eGroupAI/material/Paper";

import Tooltip from "@eGroupAI/material/Tooltip";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

import I18nDataTable from "components/I18nDataTable";
import BulletinsDataTableRow from "components/BulletinsDataTableRow";
import PermissionValid from "components/PermissionValid";

import { ServiceModuleValue, Table } from "interfaces/utils";
import { Bulletin } from "interfaces/entities";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import {
  TagAddDialog,
  TAG_ADD_DIALOG,
  TagDeleteDialog,
  TAG_DELETE_DIALOG,
} from "components/DatatableToolDialogs";
import { IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { LoadingButton } from "@mui/lab";
import { useSettingsContext } from "minimal/components/settings";

interface BulletinDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  organizationId: string;
  isRelease?: number;
  tableName: string;
}

const BulletinsDataTable: FC<Props> = function (props) {
  const { organizationId, isRelease = 0, tableName } = props;

  const router = useRouter();
  const settings = useSettingsContext();

  const [checkedAll, setCheckedAll] = useState(false);

  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      Bulletin & {
        TableRowProps: TableRowProps;
      }
    >
  >({});

  const { openDialog: openTagDialog } = useReduxDialog(
    `${ServiceModuleValue.BULLETIN}_${TAG_ADD_DIALOG}`
  );
  const { openDialog: openTagDeleteDialog } = useReduxDialog(
    `${ServiceModuleValue.BULLETIN}_${TAG_DELETE_DIALOG}`
  );

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    handleSelectFilterView,
    handleFilterValuesChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    payload,
    setPayload,
    submitedPayload,
    setSubmitedPayload,
    page,
    rowsPerPage,
  } = useDataTable<BulletinDefaultPayload>(
    `${tableName}-${organizationId}`,
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
    Table.BULLETIN,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const { excute: createBulletin, isLoading: isCreating } = useAxiosApiWrapper(
    apis.org.createBulletin,
    "Create"
  );
  const { data, isValidating, mutate } = useBulletinTableFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    {
      isRelease,
    },
    undefined,
    !filterSearch
  );

  const selectedBulletins = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as Bulletin;
        }),
    [eachRowState]
  );

  const excludedTargetIdList = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => !el?.checked)
        .map((el) => el?.data?.bulletinId || ""),
    [eachRowState]
  );

  const selectedBulletinsIdList = useMemo(
    () => selectedBulletins.map((p) => p.bulletinId),
    [selectedBulletins]
  );

  const selectedTagIdList = useMemo(
    () =>
      selectedBulletins
        .filter(
          (bulletin) => (bulletin?.organizationTagTargetList?.length ?? 0) > 0
        )
        .flatMap((bulletin) =>
          bulletin?.organizationTagTargetList?.map((tag) => tag?.id?.tagId)
        ),
    [selectedBulletins]
  );

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <div>
      <Paper>
        {filterSearch && (
          <TagAddDialog
            filterSearch={filterSearch}
            tableModule={Table.BULLETIN}
            serviceModuleValue={ServiceModuleValue.BULLETIN}
            isCheckedAllPageRows={checkedAll}
            selectedTargetIds={selectedBulletinsIdList}
            excludeSelectedTargetIds={excludedTargetIdList}
            onSuccess={() => {
              mutate();
            }}
          />
        )}
        {filterSearch && (
          <TagDeleteDialog
            filterSearch={filterSearch}
            tableModule={Table.BULLETIN}
            serviceModuleValue={ServiceModuleValue.BULLETIN}
            isCheckedAllPageRows={checkedAll}
            selectedTargetIds={selectedBulletinsIdList}
            excludeSelectedTargetIds={excludedTargetIdList}
            onSuccess={() => {
              setDeleteState(true);
              mutate();
            }}
            selectedTagIdList={checkedAll ? undefined : selectedTagIdList}
          />
        )}
        <I18nDataTable
          columns={columns}
          rowKey="bulletinId"
          data={!data ? [] : data?.source}
          renderDataRow={(rowData) => {
            const row = rowData as Bulletin;

            return (
              <BulletinsDataTableRow
                columns={columns}
                row={row}
                key={row.bulletinId}
                handleClick={(e) => {
                  e.stopPropagation();
                  window.open(`/me/bulletins/${row.bulletinId}`, "_blank");
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
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
          buttonTools={
            <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
              <Tooltip title={wordLibrary?.add ?? "新增佈告欄"}>
                <LoadingButton
                  onClick={() => {
                    createBulletin({
                      organizationId,
                      organizationTagList: [],
                      bulletinTitle: wordLibrary?.untitled ?? "未命名",
                      bulletinContent: "",
                      isRelease: 0,
                      isPinned: 0,
                    })
                      .then((res) => {
                        router.push(
                          `/me/bulletins/${res.data.bulletinId}/edit`
                        );
                        settings.onUpdate("themeLayout", "mini");
                      })
                      .catch(() => {});
                  }}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  loading={isCreating}
                  id="bulletins-add-btn"
                  data-tid="bulletins-add-btn"
                >
                  {wordLibrary?.add ?? "新增"}
                </LoadingButton>
              </Tooltip>
            </PermissionValid>
          }
          selectedToolsbar={
            <>
              {selectedBulletins.length !== 0 && (
                <PermissionValid
                  shouldBeOrgOwner
                  modulePermissions={["UPDATE_ALL"]}
                >
                  <Tooltip title={wordLibrary?.["batch tagging"] ?? "批次標註"}>
                    <div
                      role="button"
                      tabIndex={-1}
                      id="table-tools-selected-batch-tagging-btn"
                      data-tid="table-tools-selected-batch-tagging-btn"
                    >
                      <IconButton
                        onClick={() => {
                          openTagDialog();
                        }}
                        disabled={
                          (!checkedAll && selectedBulletins.length === 0) ||
                          (checkedAll &&
                            data?.total === excludedTargetIdList.length)
                        }
                        color="primary"
                        id="bulletin-table-selection-tool-tag-add-btn"
                        data-tid="bulletin-table-selection-tool-tag-add-btn"
                      >
                        <Iconify icon="ic:baseline-local-offer" width={24} />
                      </IconButton>
                    </div>
                  </Tooltip>
                </PermissionValid>
              )}
              {(checkedAll || selectedBulletins.length !== 0) &&
                selectedTagIdList.length !== 0 && (
                  <PermissionValid
                    shouldBeOrgOwner
                    modulePermissions={["DELETE_ALL"]}
                  >
                    <Tooltip
                      title={
                        wordLibrary?.["batch tagging delete"] ?? "批次標註刪除"
                      }
                    >
                      <div role="button" tabIndex={-1}>
                        <IconButton
                          onClick={() => {
                            openTagDeleteDialog();
                          }}
                          disabled={
                            (!checkedAll && selectedBulletins.length === 0) ||
                            (checkedAll &&
                              data?.total === excludedTargetIdList.length)
                          }
                          color="primary"
                          id="table-tools-selected-tagdelete-btn"
                          data-tid="table-tools-selected-tagdelete-btn"
                        >
                          <Iconify icon="mdi:tag-off" width={24} />
                        </IconButton>
                      </div>
                    </Tooltip>
                  </PermissionValid>
                )}
            </>
          }
          payload={payload}
          serviceModuleValue={ServiceModuleValue.BULLETIN}
          onFilterViewSelect={handleSelectFilterView}
          enableFilter
          enableReportTool
          filterSearch={filterSearch}
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
    </div>
  );
};

export default BulletinsDataTable;
