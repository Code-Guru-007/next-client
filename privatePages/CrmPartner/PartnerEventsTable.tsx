import React, { FC, useState } from "react";

import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import useOrgEventTableFilterSearch from "utils/useOrgEventTableFilterSearch";
import { TimelineDotProps } from "@mui/lab/TimelineDot";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

import Paper from "@eGroupAI/material/Paper";
import Tooltip from "@eGroupAI/material/Tooltip";

import { ServiceModuleValue, Table } from "interfaces/utils";
import { OrganizationEvent, OrganizationPartner } from "interfaces/entities";

import I18nDataTable from "components/I18nDataTable";
import EventsDataTableRow from "components/EventsDataTableRow";
import PermissionValid from "components/PermissionValid";
import SearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";
import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

interface EventDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  organizationId: string;
  openCreateEventDialog: () => void;
  changeBrowserMode: () => void;
  partner: OrganizationPartner;
}

const PartnerEventsTable: FC<Props> = function (props) {
  const { organizationId, openCreateEventDialog, changeBrowserMode, partner } =
    props;

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
    `CrmPartnerEventsDataTable-${partner.organizationPartnerId}`,
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

  const [view] = useState("table");
  const wordLibrary = useSelector(getWordLibrary);

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
              filterKey: "C35_1",
              value: [partner.organizationPartnerId],
            },
          ]
        : [
            {
              filterKey: "C35_1",
              value: [partner.organizationPartnerId],
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
        variant="contained"
        onClick={openCreateEventDialog}
        startIcon={<Iconify icon="mingcute:add-line" width={16} />}
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
      onChange={changeBrowserMode}
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
          rowKey="organizationPartnerId"
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
                    `/me/crm/partners/${partner.organizationPartnerId}/events/${row.organizationEventId}`,
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

export default PartnerEventsTable;
