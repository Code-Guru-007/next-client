/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";

import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import FileSaver from "file-saver";
import { useSelector } from "react-redux";
import useOrgEventTableFilterSearch from "utils/useOrgEventTableFilterSearch";
import { TimelineDotProps } from "@mui/lab/TimelineDot";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import Paper from "@eGroupAI/material/Paper";
import IconButton from "@mui/material/IconButton";
import Iconify from "minimal/components/iconify/iconify";
import Tooltip from "@eGroupAI/material/Tooltip";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { SNACKBAR as GLOBAL_SNACKBAR } from "components/App";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { OrganizationEvent } from "interfaces/entities";
import { TableRowProps } from "@eGroupAI/material/TableRow";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import I18nDataTable from "components/I18nDataTable";
import EventsDataTableRow from "components/EventsDataTableRow";
import getDispositionFileName from "@eGroupAI/utils/getDispositionFileName";
import PermissionValid from "components/PermissionValid";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { FilterSearch } from "@eGroupAI/typings/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import {
  TagAddDialog,
  TAG_ADD_DIALOG,
  TagDeleteDialog,
  TAG_DELETE_DIALOG,
} from "components/DatatableToolDialogs";
import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";

interface EventDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  organizationId: string;
  openCreateEventDialog: () => void;
  changeBrowserMode: (mode: "table" | "waterfalls") => void;
  isCreated: boolean;
}

const EventsDataTable: FC<Props> = function (props) {
  const {
    organizationId,
    openCreateEventDialog,
    changeBrowserMode,
    isCreated,
  } = props;

  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationEvent & {
        TableRowProps: TableRowProps;
      }
    >
  >({});
  const locale = useSelector(getGlobalLocale);
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [checkedAll, setCheckedAll] = useState<boolean>(false);
  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(GLOBAL_SNACKBAR);
  const { openDialog: openTagDialog } = useReduxDialog(
    `${ServiceModuleValue.EVENT}_${TAG_ADD_DIALOG}`
  );
  const { openDialog: openTagDeleteDialog } = useReduxDialog(
    `${ServiceModuleValue.EVENT}_${TAG_DELETE_DIALOG}`
  );

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
  } = useDataTable<EventDefaultPayload>(
    `EventsDataTable-${organizationId}`,
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
    Table.EVENTS,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );
  const { excute: exportOrgEventsExcel } = useAxiosApiWrapper(
    apis.org.exportOrgEventsExcel,
    "Create"
  );
  const { excute: exportSelectedOrgEventsExcel } = useAxiosApiWrapper(
    apis.org.exportSelectedOrgEventsExcel,
    "Create"
  );
  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const [view, setView] = useState("table");
  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, mode: string | null) => {
      if (mode !== null) {
        setView(mode);
        if (mode === "table" || mode === "waterfalls") changeBrowserMode(mode);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const wordLibrary = useSelector(getWordLibrary);

  const { data, mutate, isValidating } = useOrgEventTableFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    undefined,
    undefined,
    !filterSearch
  );

  const selectedEvents = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as OrganizationEvent;
        }),
    [eachRowState]
  );

  const selectedEventsIdList = useMemo(
    () => selectedEvents.map((p) => p.organizationEventId),
    [selectedEvents]
  );

  const selectedTagIdList = useMemo(
    () =>
      selectedEvents
        .filter(
          (selectedEvent) =>
            (selectedEvent?.organizationTagTargetList?.length ?? 0) > 0
        )
        .flatMap((selectedEvent) =>
          selectedEvent?.organizationTagTargetList?.map((tag) => tag?.id?.tagId)
        ),
    [selectedEvents]
  );

  const excludedTargetIdList = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => !el?.checked)
        .map((el) => el?.data?.organizationEventId as string),
    [eachRowState]
  );

  const handleDisableToolClick = useCallback(() => {
    if (selectedEvents.length === 0) {
      openSnackbar({
        message: "請勾選資料",
        severity: "warning",
      });
    }
  }, [openSnackbar, selectedEvents.length]);

  const handleExportExcel = useCallback(() => {
    const messageKey = "please wait";
    if (checkedAll && filterSearch) {
      openSnackbar({
        message: wordLibrary?.[messageKey] ?? "請稍後",
        severity: "warning",
        autoHideDuration: null,
      });
      const { startIndex, size, ...filterObject } =
        filterSearch as FilterSearch;
      exportOrgEventsExcel({
        organizationId,
        locale,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        filterObject,
        excludedTargetIdList,
      })
        .then((res) => {
          const filename = getDispositionFileName(
            res.headers["content-disposition"] as string
          );
          FileSaver.saveAs(res.data, filename);
        })
        .finally(() => {
          closeSnackbar({
            autoHideDuration: 4000,
          });
        })
        .catch((err) => {
          apis.tools.createLog({
            function: "DatePicker: handleExportExcel",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: err,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        });
    } else if (!checkedAll && selectedEvents.length > 0) {
      openSnackbar({
        message: wordLibrary?.[messageKey] ?? "請稍後",
        severity: "warning",
        autoHideDuration: null,
      });
      const selectedOrganizationEventIds = selectedEvents.map((event) => ({
        organizationEventId: event.organizationEventId,
      }));
      exportSelectedOrgEventsExcel({
        organizationId,
        locale,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // organizationEvents: selectedEvents,
        organizationEvents: selectedOrganizationEventIds,
      })
        .then((res) => {
          const filename = getDispositionFileName(
            res.headers["content-disposition"] as string
          );
          FileSaver.saveAs(res.data, filename);
        })
        .finally(() => {
          closeSnackbar({
            message: wordLibrary?.success ?? "成功",
            autoHideDuration: 4000,
          });
        })
        .catch((err) => {
          apis.tools.createLog({
            function: "exportSelectedOrgEventsExcel: handleExportExcel",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: err,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        });
    }
  }, [
    checkedAll,
    filterSearch,
    selectedEvents,
    openSnackbar,
    wordLibrary,
    exportOrgEventsExcel,
    organizationId,
    locale,
    excludedTargetIdList,
    closeSnackbar,
    exportSelectedOrgEventsExcel,
  ]);

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <Button
        variant="contained"
        onClick={openCreateEventDialog}
        startIcon={<Iconify icon="mingcute:add-line" />}
        id="table-add-button"
        data-tid="table-add-button"
      >
        {wordLibrary?.add ?? "新增"}
      </Button>
    </PermissionValid>
  );

  const iconTools = (
    <ToggleButtonGroup
      size="small"
      value={view}
      exclusive
      onChange={handleChangeView}
    >
      <ToggleButton
        value="table"
        id="events-list-view-button"
        data-tid="events-list-view-button"
      >
        <Tooltip title="列表">
          <Iconify icon="circum:view-table" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton
        value="waterfalls"
        id="table-timline-view-button"
        data-tid="table-timline-view-button"
      >
        <Tooltip title="時間軸">
          <Iconify icon="flat-color-icons:timeline" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const selectedToolsbar = (
    <>
      {(checkedAll || selectedEvents.length !== 0) && (
        <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
          <Tooltip title={wordLibrary?.download ?? "下載"}>
            <div
              onClick={handleDisableToolClick}
              onKeyPress={handleDisableToolClick}
              role="button"
              tabIndex={-1}
            >
              <IconButton
                onClick={handleExportExcel}
                disabled={
                  (!checkedAll && selectedEvents.length === 0) ||
                  (checkedAll && data?.total === excludedTargetIdList.length)
                }
                color="primary"
              >
                <Iconify icon="uil:file-download" width={24} />
              </IconButton>
            </div>
          </Tooltip>
        </PermissionValid>
      )}
      {selectedEvents.length !== 0 && (
        <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
          <Tooltip title={wordLibrary?.["batch tagging"] ?? "批次標註"}>
            <div role="button" tabIndex={-1}>
              <IconButton
                onClick={() => {
                  openTagDialog();
                }}
                disabled={
                  (!checkedAll && selectedEvents.length === 0) ||
                  (checkedAll && data?.total === excludedTargetIdList.length)
                }
                color="primary"
              >
                <Iconify icon="ic:baseline-local-offer" width={24} />
              </IconButton>
            </div>
          </Tooltip>
        </PermissionValid>
      )}
      {(checkedAll || selectedTagIdList.length !== 0) &&
        selectedTagIdList.length !== 0 && (
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
                    (!checkedAll && selectedEvents.length === 0) ||
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
  );

  useEffect(() => {
    if (isCreated) {
      mutate();
    }
  }, [isCreated, mutate]);

  return (
    <div>
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="organizationEventId"
          data={!data ? [] : data?.source}
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
          renderDataRow={(rowData) => {
            const row = rowData as OrganizationEvent;

            const endDate = new Date(row.organizationEventEndDate);

            let status: TimelineDotProps["color"] = "success";
            if (row.organizationEventIsOpen && endDate < new Date()) {
              status = "warning";
            } else if (!row.organizationEventIsOpen) {
              status = "grey";
            }

            return (
              <EventsDataTableRow
                columns={columns}
                row={row}
                key={row.organizationEventId}
                status={status}
                handleClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `/me/event/events/${row.organizationEventId}`,
                    "_blank"
                  );
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
          buttonTools={buttonTools}
          iconTools={iconTools}
          selectedToolsbar={selectedToolsbar}
          enableRowCheckbox
          onCheckedAllClick={handleCheckedAllClick}
          onCheckedAllClearClick={handleCheckedAllClearClick}
          enableFilter
          filterConditionGroups={filterConditionGroups}
          onFilterValuesChange={handleFilterValuesChange}
          onFilterValuesSubmit={handleFilterValuesSubmit}
          onFilterValuesClear={handleFilterValuesClear}
          onFilterViewSelect={handleSelectFilterView}
          payload={payload}
          serviceModuleValue={ServiceModuleValue.EVENT}
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
      {filterSearch && (
        <TagAddDialog
          filterSearch={filterSearch}
          tableModule={Table.EVENTS}
          serviceModuleValue={ServiceModuleValue.EVENT}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedEventsIdList}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            mutate();
          }}
        />
      )}
      {filterSearch && (
        <TagDeleteDialog
          filterSearch={filterSearch}
          tableModule={Table.EVENTS}
          serviceModuleValue={ServiceModuleValue.EVENT}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedEventsIdList}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            setDeleteState(true);
            mutate();
          }}
          selectedTagIdList={checkedAll ? undefined : selectedTagIdList}
        />
      )}
    </div>
  );
};

export default EventsDataTable;
