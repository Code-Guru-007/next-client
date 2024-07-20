import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/router";
import { format } from "@eGroupAI/utils/dateUtils";
import useOrgMemberFilterSearch from "@eGroupAI/hooks/apis/useOrgMemberFilterSearch";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { makeStyles } from "@mui/styles";
import useTab from "@eGroupAI/hooks/useTab";
import useOrgCalendars from "utils/useOrgCalendars";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";

import PrivateLayout from "components/PrivateLayout";

import {
  Eventcalendar,
  MbscEventcalendarView,
  MbscPageLoadingEvent,
} from "@mobiscroll/react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import NewFilterDropDown from "@eGroupAI/material-lab/FilterDropDown/NewFilterDropDown";
import {
  Value as FilterValue,
  NumberRangeStates,
  Option,
} from "@eGroupAI/material-lab/FilterDropDown";

import {
  optionToValueType,
  optionsToValue,
} from "@eGroupAI/material-lab/FilterDropDown/utils";
import { getFilterValueCountV2 } from "@eGroupAI/material-module/DataTable/utils";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import { Table } from "interfaces/utils";

import { Button, useTheme } from "@mui/material";
import SearchBar from "@eGroupAI/material-module/SearchBar";
import Main from "@eGroupAI/material-layout/Main";
import Box from "@eGroupAI/material/Box";
import Container from "@eGroupAI/material/Container";
import IconButton from "@eGroupAI/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import CircularProgress from "@eGroupAI/material/CircularProgress";
import { useSettingsContext } from "minimal/components/settings";
import Iconify from "minimal/components/iconify/iconify";
import { OrganizationEvent } from "interfaces/entities";
import ResponsiveTabs from "components/ResponsiveTabs/ResponsiveTabs";
import { useResponsive } from "minimal/hooks/use-responsive";
import clsx from "clsx";

import CalendarHeader from "./CalendarHeader";
import CalendarList from "./CalendarList";
import CalendarDialog, { DIALOG, CalendarDialogProps } from "./CalendarDialog";
import EventDialog, {
  DefaultOrgEvent,
  DIALOG as EVENT_DIALOG,
  EventDialogProps,
} from "./EventDialog";
import useResources from "./useResources";
import useSchedules from "./useSchedules";
import useFilterOptions from "./useFilterOptions";
import useCalendarEventsFilterPayload from "./useCalendarEventsFilterPayload";
import { OnCalendarMenuItemClick } from "./CalendarList/CalendarList";

const useStyles = makeStyles((theme) => ({
  firstTab: {
    marginLeft: 21,
  },
  paper: {
    paddingTop: 12,
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    padding: "24px 8px",
  },
  searchBar: {
    minWidth: 150,
  },
  content: {
    display: "flex",
  },
  sideMenu: {
    position: "relative",
    marginTop: 85,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: "#cfcfcf",

    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      borderTopWidth: 1,
      borderTopStyle: "solid",
      borderColor: "#cfcfcf",
    },
  },
  sideMenuSm: {
    position: "relative",
    marginTop: 5,
    marginBottom: 5,

    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      borderTopWidth: 1,
      borderTopStyle: "solid",
      borderColor: "#cfcfcf",
    },
  },
  addEventWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "16px 8px 0px 24px",
  },
  addEventBtn: {
    color: theme.palette.grey[300],
    backgroundColor: theme.palette.grey[600],
    right: 0,
  },
  asyncBtns: {
    display: "flex",
    gap: 8,
    padding: 36,
    borderBottom: "1px solid #D9D9D9",
  },
  eventcalendar: {
    position: "relative",
    flex: 1,
    marginTop: 25,
    overflowY: "hidden",
    overflowX: "auto",
  },
  calendarLoading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
}));

const Calendar = () => {
  const wordLibrary = useSelector(getWordLibrary);
  const tabsData = [
    {
      value: "info",
      label: "info",
    },
  ];
  const theme = useTheme();
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const router = useRouter();
  const { query, push, pathname } = useRouter();
  const isDownSm = useResponsive("down", "sm");

  const urlParams = new URLSearchParams(window.location.search);
  const tabValue = urlParams.get("tab");

  const { value, handleChange } = useTab<string>(
    "Calendar",
    tabValue || "none",
    true
  );
  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [handleChange, query.tab]);

  useEffect(() => {
    if (value === "none") {
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || "info",
        },
      });
    }
  }, [pathname, push, query, handleChange, value]);

  const { openDialog } = useReduxDialog(DIALOG);
  const { openDialog: openEventDialog } = useReduxDialog(EVENT_DIALOG);
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);
  const [selectedLayoutOption, setSelectedLayoutOption] = useState("month");
  const [selectedOrgCalendarId, setSelectedOrgCalendarId] = useState<string>();
  const [selectedOrgEventId, setSelectedOrgEventId] = useState<string>();
  const [defaultOrgEvent, setDefaultOrgEvent] = useState<DefaultOrgEvent>();
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [calendarEditingMode, setCalendarEditingMode] =
    useState<CalendarDialogProps["editingMode"]>("create");
  const [eventEditingMode, setEventEditingMode] =
    useState<EventDialogProps["editingMode"]>("create");
  const [selectedOrgCalendarIds, setSelectedOrgCalendarIds] = useState<
    string[]
  >([]);
  const [selectedOauthCalendarIds, setSelectedOauthCalendarIds] = useState<
    string[]
  >([]);
  const [viewOptions, setViewOptions] = useState<MbscEventcalendarView>({
    calendar: {
      type: "month",
      labels: true,
      size: 1,
    },
  });
  const calendarRef = useRef<Eventcalendar>(null);

  const { excute: deleteOrgCalendar } = useAxiosApiWrapper(
    apis.org.deleteOrgCalendar,
    "Delete"
  );
  const { excute: deleteOrgCalendarOauth } = useAxiosApiWrapper(
    apis.org.deleteOrgCalendarOauth,
    "Delete"
  );
  const { excute: getOrgCalendarOAuthUrl } = useAxiosApiWrapper(
    apis.org.getOrgCalendarOAuthUrl,
    "None"
  );

  const {
    data: orgCalendarsData,
    isValidating: isCalendarsValidating,
    mutate: mutateCalendars,
  } = useOrgCalendars(
    {
      organizationId,
    },
    undefined,
    {
      revalidateOnFocus: false,
    }
  );
  const orgCalendars = useMemo(
    () => orgCalendarsData?.filter((el) => !el.isOAuthCalendar),
    [orgCalendarsData]
  );
  const myCalendars = useMemo(
    () =>
      orgCalendarsData
        ?.filter(
          (el, index, calendars) =>
            index ===
            calendars.findIndex(
              (cal) => cal.organizationCalendarId === el.organizationCalendarId
            )
        )
        .filter((el) => el.isOAuthCalendar),
    [orgCalendarsData]
  );
  const { data: members } = useOrgMemberFilterSearch({
    organizationId,
  });

  const {
    handleSearchChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    payload,
    setPayload,
    submitedPayload,
    setSubmitedPayload,
  } = useCalendarEventsFilterPayload(
    organizationId,
    {},
    { enableLocalStorageCache: true }
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

  const filterOptions = useFilterOptions(filterConditionGroups);

  const settings = useSettingsContext();

  const [filterValues, setFilterValues] = useState({});
  const [savedFilterValues, setSavedFilterValues] = useState(filterValues);
  const detailedDefaultFilterValues = filterOptions
    ? filterOptions
        .map(({ filterConditionList }, index) => ({
          [index]: filterConditionList
            .map((option) => ({
              [option.filterId]: optionToValueType(option, null, null),
            }))
            .reduce((a, b) => ({ ...a, ...b }), {}),
        }))
        .reduce((a, b) => ({ ...a, ...b }), {})
    : {};
  let next = filterValues;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultNumberRangeStates = filterOptions
    ? filterOptions?.map(({ filterConditionList }, index) =>
        filterConditionList
          .filter((o) => o.type === "NUMBER_RANGE")
          .map((el) => ({
            [el.filterId]: Boolean(
              ((savedFilterValues[index] || {})[el.filterId] as (
                | number
                | null
              )[])
                ? (
                    (savedFilterValues[index] || {})[el.filterId] as (
                      | number
                      | null
                    )[]
                  )[0]
                : null
            ),
          }))
          .reduce<NumberRangeStates>((a, b) => ({ ...a, ...b }), {})
      )
    : [];

  const isOAuthCalendar = useMemo(() => {
    if (!myCalendars || !myCalendars.length) return false;
    return myCalendars.every((el) => el.isOAuthCalendar === 1);
  }, [myCalendars]);

  const mergedCalendars = useMemo(
    () => [...(orgCalendars || []), ...(myCalendars || [])],
    [orgCalendars, myCalendars]
  );
  const { schedules, setSchedule, removeSchedule, isEventsLoading } =
    useSchedules({
      organizationId,
      orgCalendarIds: selectedOrgCalendarIds,
      oauthCalendarIds: selectedOauthCalendarIds,
      startDate,
      endDate,
      orgCalendars: mergedCalendars,
      filterSearch,
    });
  const resources = useResources(mergedCalendars);

  useEffect(() => {
    if (!isCalendarsValidating) {
      const orgCalendarIds = [
        ...new Set(
          mergedCalendars
            .filter((el) => el.isSelected === 1 && !el.isOAuthCalendar)
            .map((el) => el.organizationCalendarId)
        ),
      ];
      setSelectedOrgCalendarIds(orgCalendarIds);
      const oauthCalendarIds = [
        ...new Set(
          mergedCalendars
            .filter((el) => el.isSelected === 1 && el.isOAuthCalendar)
            .map((el) => el.organizationCalendarId)
        ),
      ];
      setSelectedOauthCalendarIds(oauthCalendarIds);
    }
  }, [mergedCalendars, isCalendarsValidating]);

  const handleChangeLayout = (layout: string) => {
    switch (layout) {
      case "month":
        setViewOptions({
          calendar: {
            type: "month",
            labels: true,
            popover: true,
          },
        });
        break;
      case "week":
        setViewOptions({
          schedule: {
            type: "week",
            // size: 1
          },
        });
        break;
      case "day":
        setViewOptions({
          schedule: {
            type: "day",
            size: 1,
          },
        });
        break;
      default:
        break;
    }
    setSelectedLayoutOption(layout);
  };

  const handlePageLoading = useCallback(
    (event: MbscPageLoadingEvent) => {
      setStartDate(event.firstDay);
      setEndDate(event.lastDay);
    },
    [setStartDate, setEndDate]
  );

  const handleOrgCalendarChange = (e, checked) => {
    if (checked) {
      setSelectedOrgCalendarIds([...selectedOrgCalendarIds, e.target.value]);
    } else {
      setSelectedOrgCalendarIds(
        selectedOrgCalendarIds.filter((id) => id !== e.target.value)
      );
      removeSchedule(e.target.value);
    }
  };

  const handleOauthCalendarChange = (e, checked) => {
    if (checked) {
      setSelectedOauthCalendarIds([
        ...selectedOauthCalendarIds,
        e.target.value,
      ]);
    } else {
      setSelectedOauthCalendarIds(
        selectedOauthCalendarIds.filter((id) => id !== e.target.value)
      );
      removeSchedule(e.target.value);
    }
  };

  const handleCalendarAddClick = () => {
    setSelectedOrgCalendarId(undefined);
    setCalendarEditingMode("create");
    openDialog(DIALOG);
  };

  const handleEditCalendarClick: OnCalendarMenuItemClick = (_, el) => {
    setSelectedOrgCalendarId(el.organizationCalendarId);
    setCalendarEditingMode("update");
    openDialog(DIALOG);
  };

  const handleDeleteCalendarClick: OnCalendarMenuItemClick = (_, el) => {
    openConfirmDeleteDialog({
      primary: `您確定要刪除${el.organizationCalendarName}嗎？`,
      onConfirm: async () => {
        await deleteOrgCalendar({
          organizationId,
          organizationCalendarId: el.organizationCalendarId,
        });
        removeSchedule(el.organizationCalendarId);
        mutateCalendars();
        closeConfirmDeleteDialog();
      },
    });
  };

  const handleSyncPersonalCalendar = () => {
    getOrgCalendarOAuthUrl({
      organizationId,
    })
      .then((res) => {
        window.localStorage.setItem("calendarOAuthOrgId", organizationId);
        window.open(
          res.data as string,
          "_blank",
          "width=600,height=600,top=100,left=100"
        );
      })
      .catch(() => {});
  };

  const handleRevokeOAuth = () => {
    openConfirmDeleteDialog({
      primary: `Do you really want to revoke OAuth Calendars?`,
      onConfirm: async () => {
        deleteOrgCalendarOauth({
          organizationId,
        })
          .then(() => {
            mutateCalendars();
            closeConfirmDeleteDialog();
            router.reload();
          })
          .catch(() => {});
      },
    });
  };

  const handleEventClick = (event) => {
    if (event.event.isDefaultCalendar) {
      setDefaultOrgEvent({
        organizationCalendarEventId: event.event.id,
        organizationCalendar: {
          organizationCalendarId: event.event.resource,
        },
        organizationEventTitle: event.event.text,
        organizationEventAddress: "",
        organizationEventStartDate:
          format(event.event.start, "yyyy-MM-dd") || "",
        organizationEventEndDate: format(event.event.end, "yyyy-MM-dd") || "",
        organizationEventDescription: event.event.description,
        organizationMemberList: [],
      });
      setSelectedOrgEventId(undefined);
    } else if (!event.event.isDefaultCalendar && !event.event.eventId) {
      setDefaultOrgEvent({
        organizationCalendarEventId: event.event.id,
        organizationCalendar: {
          organizationCalendarId: event.event.resource,
        },
        organizationEventTitle: event.event.text,
        organizationEventAddress: event.event.address,
        organizationEventStartDate:
          format(event.event.start, "yyyy-MM-dd") || "",
        organizationEventEndDate: format(event.event.end, "yyyy-MM-dd") || "",
        organizationEventDescription: event.event.description,
        organizationMemberList: [],
      });
      setSelectedOrgEventId(undefined);
    } else {
      setDefaultOrgEvent(undefined);
      setSelectedOrgEventId(event.event.eventId);
    }
    setSelectedOrgCalendarId(event.event.calendarId);
    setEventEditingMode("update");
    openEventDialog();
  };

  const handleAddEventClick = () => {
    setEventEditingMode("create");
    setSelectedOrgEventId(undefined);
    openEventDialog();
  };

  const handleCalendarDialogSubmitSuccess = () => {
    mutateCalendars();
  };

  const handleEventDialogSubmitSuccess = (values: OrganizationEvent) => {
    setSchedule(values.organizationCalendar.organizationCalendarId);
  };

  const handleSearchBarChange = (value) => {
    setSearchQuery(value);
    handleSearchChange(value);
  };

  const renderAsyncBtns = () => {
    if (isOAuthCalendar === undefined) {
      return undefined;
    }
    return (
      <div className={classes.asyncBtns}>
        {!isOAuthCalendar ? (
          <Button
            onClick={handleSyncPersonalCalendar}
            variant="contained"
            color="primary"
          >
            同步個人行事曆
          </Button>
        ) : (
          <Button
            onClick={handleRevokeOAuth}
            variant="contained"
            color="primary"
          >
            Revoke OAuth
          </Button>
        )}
      </div>
    );
  };

  const handleFilterDropDownSave = useCallback(
    (value: FilterValue, i: number) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      next = {
        ...filterValues,
        [i]: value,
      };
      setSavedFilterValues(next);
    },
    [filterValues]
  );

  const handleFilterDropDownCancel = useCallback(
    (savedValue: FilterValue, i: number) => {
      const before = {
        ...filterValues,
        [i]: savedValue,
      };
      setFilterValues(before);
    },
    [filterValues, setFilterValues]
  );

  const handleFilterDropDownSubmit = useCallback(
    (value: FilterValue, i: number) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      next = {
        ...filterValues,
        [i]: value,
      };
      const valueParamToSubmit = {
        ...detailedDefaultFilterValues[i],
        ...value,
      };

      setFilterValues(next);
      setSavedFilterValues(next);
      handleFilterValuesSubmit(next);
      handleFilterSubmit(valueParamToSubmit);
    },
    [filterValues, setFilterValues]
  );

  const handleFilterDropDownClear = useCallback(
    (e, i: number, options: Option[]) => {
      e.stopPropagation();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      next = {
        ...filterValues,
        [i]: {},
      };
      setFilterValues(next);
      setSavedFilterValues(next);
      handleFilterValuesClear(next);
      handleFilterClear(e, optionsToValue(options, null, null));
    },
    [filterValues, setFilterValues]
  );

  const renderFilterDropDown = useCallback(
    (label: string, options: Option[], index: number) => {
      if (!filterValues || !savedFilterValues) return undefined;
      const [filterCount, hasTriggerRange] = getFilterValueCountV2(
        filterValues[index] as FilterValue
      );
      const isActive = filterCount > 0;
      let endIcon = (
        <ArrowBackIosNewRoundedIcon
          fontSize="small"
          style={{
            transform: "rotate(270deg)",
          }}
        />
      );
      if (isActive || hasTriggerRange) {
        endIcon = (
          <IconButton
            color="white"
            size="small"
            component="span"
            onClick={(e) => {
              handleFilterDropDownClear(e, index, options);
            }}
            sx={{
              padding: "1.5px",
            }}
          >
            <CloseRoundedIcon sx={{ color: theme.palette.grey[500] }} />
          </IconButton>
        );
      }

      return (
        <div key={label}>
          <NewFilterDropDown
            rounded
            variant="contained"
            disableElevation
            color={isActive || hasTriggerRange ? "info" : "primary"}
            value={filterValues[index] || {}}
            savedValue={savedFilterValues[index] || {}}
            onSubmit={(value) => handleFilterDropDownSubmit(value, index)}
            onClear={(e) => {
              handleFilterDropDownClear(e, index, options);
            }}
            onSave={(value) => handleFilterDropDownSave(value, index)}
            onCancel={(value) => handleFilterDropDownCancel(value, index)}
            options={options}
            endIcon={endIcon}
            selected={isActive}
            selectedNumber={filterCount}
            defaultNumberRangeStates={
              defaultNumberRangeStates[index] as NumberRangeStates
            }
          >
            <span>{label}</span>
          </NewFilterDropDown>
        </div>
      );
    },
    [
      defaultNumberRangeStates,
      filterValues,
      handleFilterDropDownCancel,
      handleFilterDropDownClear,
      handleFilterDropDownSave,
      handleFilterDropDownSubmit,
      savedFilterValues,
      theme.palette.grey,
    ]
  );

  const translatedTitle = `${wordLibrary?.["行事曆"] ?? "行事曆"} | ${
    wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
  } `;

  return (
    <PrivateLayout title={translatedTitle}>
      <CalendarDialog
        editingMode={calendarEditingMode}
        organizationCalendarId={selectedOrgCalendarId}
        onSubmitSuccess={handleCalendarDialogSubmitSuccess}
      />
      <EventDialog
        organizationId={organizationId}
        organizationEventId={selectedOrgEventId}
        editingMode={eventEditingMode}
        orgCalendars={mergedCalendars}
        members={members?.source}
        onSubmitSuccess={handleEventDialogSubmitSuccess}
        defaultOrgEvent={defaultOrgEvent}
        hideEdit={!!defaultOrgEvent}
        displayTimeFormat={defaultOrgEvent ? "PP" : undefined}
      />
      <Main>
        <Container>
          <ResponsiveTabs
            value={value}
            tabData={tabsData}
            onChange={(value) => {
              push({
                pathname,
                query: {
                  ...query,
                  tab: value,
                },
              });
            }}
          />
          <div className={classes.addEventWrapper}>
            <Button
              // className={classes.addEventBtn}
              variant="contained"
              onClick={handleAddEventClick}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              <span>新增活動</span>
            </Button>
          </div>
          <div className={classes.header}>
            {filterOptions?.map((el, index) =>
              renderFilterDropDown(
                el.filterConditionGroupName,
                el.filterConditionList,
                index
              )
            )}
            <Box flexGrow={1} />
            <SearchBar
              className={classes.searchBar}
              size="small"
              placeholder="搜尋"
              value={searchQuery}
              handleSearch={handleSearchBarChange}
            />
          </div>
          {isDownSm && (
            <div className={classes.sideMenuSm}>
              <CalendarList
                calendars={orgCalendars}
                editable
                onCalendarChange={handleOrgCalendarChange}
                onCalendarAddClick={handleCalendarAddClick}
                onCalendarEditClick={handleEditCalendarClick}
                onCalendarDeleteClick={handleDeleteCalendarClick}
              />
              <Box borderBottom="1px solid #D9D9D9" />
              {myCalendars && myCalendars.length > 0 && (
                <CalendarList
                  calendars={myCalendars}
                  onCalendarChange={handleOauthCalendarChange}
                />
              )}
              {renderAsyncBtns()}
            </div>
          )}
          <div className={classes.content}>
            {!isDownSm && (
              <div className={classes.sideMenu}>
                <CalendarList
                  calendars={orgCalendars}
                  editable
                  onCalendarChange={handleOrgCalendarChange}
                  onCalendarAddClick={handleCalendarAddClick}
                  onCalendarEditClick={handleEditCalendarClick}
                  onCalendarDeleteClick={handleDeleteCalendarClick}
                />
                <Box borderBottom="1px solid #D9D9D9" />
                {myCalendars && myCalendars.length > 0 && (
                  <CalendarList
                    calendars={myCalendars}
                    onCalendarChange={handleOauthCalendarChange}
                  />
                )}
                {renderAsyncBtns()}
              </div>
            )}
            <Box
              className={classes.eventcalendar}
              sx={{
                "& .mbsc-material-dark.mbsc-eventcalendar": {
                  backgroundColor: theme.palette.background.paper,
                },
                "& .mbsc-material.mbsc-calendar-picker-slide, & .mbsc-material.mbsc-calendar-slide":
                  {
                    backgroundColor: theme.palette.background.paper,
                  },
                "& .mbsc-material.mbsc-calendar-height-md .mbsc-calendar-day, & .mbsc-material-dark.mbsc-calendar-height-md .mbsc-calendar-day, & .mbsc-material-dark.mbsc-calendar-height-md .mbsc-calendar-day:after, & .mbsc-material-dark.mbsc-calendar-height-md .mbsc-calendar-week-day":
                  {
                    borderColor:
                      settings.themeMode === "dark" ? "#394550" : "#cfcfcf",
                  },
                "& .mbsc-material-dark.mbsc-event-day.mbsc-list-header, .mbsc-material-dark.mbsc-schedule-date-header":
                  {
                    background: "none",
                  },
                "& .mbsc-material.mbsc-schedule-all-day-item:after, .mbsc-material.mbsc-schedule-column, .mbsc-material.mbsc-schedule-item, .mbsc-material.mbsc-schedule-resource, .mbsc-material.mbsc-schedule-resource-group, .mbsc-material.mbsc-schedule-time-col, .mbsc-material.mbsc-timeline-column, .mbsc-material.mbsc-timeline-day:after, .mbsc-material.mbsc-timeline-header, .mbsc-material.mbsc-timeline-header-column, .mbsc-material.mbsc-timeline-header-date, .mbsc-material.mbsc-timeline-header-month, .mbsc-material.mbsc-timeline-header-week, .mbsc-material.mbsc-timeline-resource, .mbsc-material.mbsc-timeline-resource-empty, .mbsc-material.mbsc-timeline-slot-header, .mbsc-material.mbsc-timeline-slots":
                  {
                    borderColor:
                      settings.themeMode === "dark" ? "#394550" : "#cfcfcf",
                  },
              }}
            >
              {isEventsLoading && (
                <div
                  className={clsx(classes.calendarLoading, classes.darkOpacity)}
                >
                  <CircularProgress />
                </div>
              )}
              <Eventcalendar
                data={schedules}
                resources={resources}
                theme="material"
                themeVariant={settings.themeMode}
                clickToCreate={false}
                dragToCreate={false}
                dragToMove={false}
                dragToResize={false}
                calendarScroll="vertical"
                view={viewOptions}
                ref={calendarRef}
                onPageLoading={handlePageLoading}
                onEventClick={handleEventClick}
                renderHeader={() => (
                  <CalendarHeader
                    selectedLayoutOption={selectedLayoutOption}
                    handleChangeLayout={handleChangeLayout}
                  />
                )}
              />
            </Box>
          </div>
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default Calendar;
