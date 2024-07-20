import React, { FC, useCallback, useState } from "react";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import { makeStyles } from "@mui/styles";

import { OrganizationPartner } from "interfaces/entities";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useDataTableFilterColumns, {
  FilterValues,
} from "utils/useDataTableFilterColumns";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import useOrgEventTableFilterSearch from "utils/useOrgEventTableFilterSearch";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { DIALOG } from "components/EventDialog";

import Center from "@eGroupAI/material-layout/Center";
import Tooltip from "@eGroupAI/material/Tooltip";
import Typography from "@eGroupAI/material/Typography";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import DataTableHeader from "@eGroupAI/material-module/DataTable/DataTableHeader";
import EventTimeLine from "components/EventTimeLine";
import PermissionValid from "components/PermissionValid";
import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";
import DataTableToolBar from "@eGroupAI/material-module/DataTable/DataTableToolBar";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

const useStyles = makeStyles(() => ({
  header: {
    "& .MuiEgDataTableHeader-filterbar": {
      backgroundColor: "transparent",
    },
  },
}));

interface EventDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

export interface PartnerEventsProps {
  partner: OrganizationPartner;
  changeBrowserMode: (mode: "table" | "waterfalls") => void;
}

const PartnerEventsWaterfalls: FC<PartnerEventsProps> = function (props) {
  const { partner, changeBrowserMode } = props;
  const classes = useStyles();

  const organizationId = useSelector(getSelectedOrgId);
  const { openDialog } = useReduxDialog(DIALOG);

  const {
    rowsPerPage,
    handleSearchChange,
    handleSelectFilterView,
    handleFilterValuesChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload,
  } = useDataTable<EventDefaultPayload>(
    `CrmPartnerEventsDataTable-${partner.organizationPartnerId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const {
    filterSearch,
    filterConditionGroups,
    handleFilterSubmit,
    handleFilterClear,
  } = useDataTableFilterColumns(
    Table.EVENTS,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const defaultFilterValues = filterConditionGroups
    ?.map((c, i) => ({ [i]: {} }))
    .reduce((a, b) => ({ ...a, ...b }), {}) as FilterValues;

  const wordLibrary = useSelector(getWordLibrary);

  const [view, setView] = useState("waterfalls");
  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, mode: string | null) => {
      if (mode !== null) {
        setView(mode);
        if (mode === "table" || mode === "waterfalls") changeBrowserMode(mode);
      }
    },
    [changeBrowserMode]
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

  const renderContent = () => {
    if (!data || isValidating) {
      return (
        <Center height={200}>
          <CircularProgress />
        </Center>
      );
    }
    if (data.source.length === 0) {
      return (
        <Center height={200}>
          <Typography variant="body1">
            {wordLibrary?.["no data available"] ?? "無資料"}
          </Typography>
        </Center>
      );
    }
    return (
      <EventTimeLine
        data={data.source}
        formatHref={(eventId) =>
          `/me/crm/users/${partner.organizationPartnerId}/events/${eventId}`
        }
      />
    );
  };

  const buttonTools = (
    <PermissionValid
      shouldBeOrgOwner
      modulePermissions={["CREATE"]}
      targetPath="/me/event/events"
    >
      <Button
        onClick={openDialog}
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
    <>
      <DataTableToolBar
        rowsPerPage={rowsPerPage}
        buttonTools={buttonTools}
        iconTools={iconTools}
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
      <DataTableHeader
        className={classes.header}
        payload={payload}
        serviceModuleValue={ServiceModuleValue.EVENT}
        enableFilter
        filterConditionGroups={filterConditionGroups}
        defaultFilterValues={defaultFilterValues}
        filterValues={payload.filterValues}
        onFilterViewSelect={handleSelectFilterView}
        onFilterValuesChange={handleFilterValuesChange}
        onFilterValuesSubmit={handleFilterValuesSubmit}
        onFilterValuesClear={handleFilterValuesClear}
        FilterDropDownProps={{
          onSubmit: handleFilterSubmit,
          onClear: handleFilterClear,
        }}
        SearchBarProps={{
          placeholder: wordLibrary?.search ?? "搜尋",
          onChange: handleSearchChange,
          defaultValue: payload.query,
        }}
      />
      {renderContent()}
    </>
  );
};

export default PartnerEventsWaterfalls;
