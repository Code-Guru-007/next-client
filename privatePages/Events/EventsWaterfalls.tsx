import React, { FC, useMemo, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { makeStyles, useTheme } from "@mui/styles";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useDetectScrollAtBottom from "@eGroupAI/hooks/useDetectScrollAtBottom";
import { DefaultPayload } from "@eGroupAI/material-module/DataTable/useDataTable";

import Typography from "@eGroupAI/material/Typography";
import DataTableHeader from "@eGroupAI/material-module/DataTable/DataTableHeader";
import MobileTableHeader from "@eGroupAI/material-module/DataTable/MobileTableHeader";
import Center from "@eGroupAI/material-layout/Center";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import Tooltip from "@eGroupAI/material/Tooltip";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { OrganizationEvent } from "interfaces/entities";
import useDataTableFilterColumns, {
  FilterValues,
} from "utils/useDataTableFilterColumns";
import useOrgEventFilterSearch from "utils/useOrgEventFilterSearch";
import { ServiceModuleValue, Table } from "interfaces/utils";

import EventTimeLine from "components/EventTimeLine";
import PermissionValid from "components/PermissionValid";
import {
  Button,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";
import DataTableToolBar from "@eGroupAI/material-module/DataTable/DataTableToolBar";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

const useStyles = makeStyles(() => ({
  header: {
    "& .MuiEgDataTableHeader-filterbar": {
      backgroundColor: "transparent",
    },
  },
  addBtn: {
    position: "fixed",
    bottom: 33,
    right: 33,
    color: "#fff",
  },
}));

interface EventDefaultPayload extends DefaultPayload {
  startIndex?: number;
}

interface Props {
  changeBrowserMode: (mode: "table" | "waterfalls") => void;
  openCreateEventDialog: () => void;
  isCreated: boolean;
}

const EventsWaterfalls: FC<Props> = function (props) {
  const { changeBrowserMode, openCreateEventDialog, isCreated } = props;

  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const organizationId = useSelector(getSelectedOrgId);

  const {
    handleSearchChange,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload,
    handleFilterValuesChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    handleSelectFilterView,
    rowsPerPage,
  } = useDataTable<EventDefaultPayload>(
    `CrmEventDataTable-${organizationId}`,
    {
      size: 10,
    },
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const {
    filterConditionGroups,
    filterSearch,
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

  const { data, mutate, setSize, isValidating } = useOrgEventFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    undefined,
    filterSearch?.size
  );

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

  const events = useMemo(
    () => data?.reduce<OrganizationEvent[]>((a, b) => [...a, ...b.source], []),
    [data]
  );

  const handleScrollAtBottom = useCallback(() => {
    if (!isValidating) {
      setSize((v) => v + 1);
    }
  }, [isValidating, setSize]);

  useDetectScrollAtBottom(handleScrollAtBottom);

  useEffect(() => {
    if (isCreated) {
      mutate();
    }
  }, [isCreated, mutate]);

  const buttonTools = (
    <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
      <Button
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

  const renderContent = () => {
    if (data && data[0]?.total === 0) {
      return (
        <Center offsetTop={400}>
          <Typography variant="h6" gutterBottom>
            {wordLibrary?.["no information found"] ?? "查無資料"}
          </Typography>
        </Center>
      );
    }
    return (
      <>
        <EventTimeLine data={events} />
        {isValidating && (
          <Center height={100}>
            <CircularProgress />
          </Center>
        )}
      </>
    );
  };

  return (
    <Paper>
      {!isDownSm && (
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
        </>
      )}
      {isDownSm && (
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
          <MobileTableHeader
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
        </>
      )}

      {renderContent()}
    </Paper>
  );
};

export default EventsWaterfalls;
