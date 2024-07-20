import React, { FC, useCallback, useState } from "react";

import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import useOrgEventTableFilterSearch from "utils/useOrgEventTableFilterSearch";
import { TimelineDotProps } from "@mui/lab/TimelineDot";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import { useSelector } from "react-redux";

import Paper from "@eGroupAI/material/Paper";
import Tooltip from "@eGroupAI/material/Tooltip";

import { ServiceModuleValue, Table } from "interfaces/utils";
import { OrganizationEvent } from "interfaces/entities";
import { OrganizationMember } from "@eGroupAI/typings/apis";

import I18nDataTable from "components/I18nDataTable";
import EventsDataTableRow from "components/EventsDataTableRow";
import PermissionValid from "components/PermissionValid";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

interface EventDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface MemberEventsTableProps {
  orgMember?: OrganizationMember;
  organizationId?: string;
  openCreateEventDialog?: () => void;
  changeBrowserMode: (mode: "table" | "waterfalls") => void;
}

const MemberEventsTable: FC<MemberEventsTableProps> = function (props) {
  const {
    organizationId,
    openCreateEventDialog,
    changeBrowserMode,
    orgMember,
  } = props;

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
    `HrmMemberEventsDataTable-${orgMember?.member.loginId}`,
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

  const [view, setView] = useState("table");
  const wordLibrary = useSelector(getWordLibrary);

  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, mode: string | null) => {
      if (mode !== null) {
        setView(mode);
        if (mode === "table" || mode === "waterfalls") changeBrowserMode(mode);
      }
    },
    []
  );

  const { data, isValidating } = useOrgEventTableFilterSearch(
    {
      organizationId,
    },
    {
      ...filterSearch,
      equal: filterSearch?.equal
        ? [
            ...filterSearch.equal,
            {
              filterKey: "C35_1", // filter Key should be orgMember's key in Event
              value: [orgMember?.member.loginId as string] || [],
            },
          ]
        : [
            {
              filterKey: "C35_1",
              value: [orgMember?.member.loginId as string] || [],
            },
          ],
    },
    undefined,
    undefined,
    !filterSearch
  );

  const buttonTools = (
    <PermissionValid
      shouldBeOrgOwner
      modulePermissions={["CREATE"]}
      targetPath="/me/event/events"
    >
      <Button
        id="table-add-btn"
        data-tid="table-add-btn"
        onClick={openCreateEventDialog}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
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
      <ToggleButton value="table">
        <Tooltip title="列表">
          <Iconify icon="circum:view-table" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="waterfalls">
        <Tooltip title="時間軸">
          <Iconify icon="flat-color-icons:timeline" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );

  return (
    <div>
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="organizationEventId"
          data={!data ? [] : data?.source}
          enableRowCheckbox
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
                handleClick={() =>
                  window.open(
                    `/me/members/list/${orgMember?.member.loginId}/events/${row.organizationEventId}`,
                    "_blank"
                  )
                }
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
        />
      </Paper>
    </div>
  );
};

export default MemberEventsTable;
