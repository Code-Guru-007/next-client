import React, { useCallback, useEffect, useState, useMemo } from "react";

import useControlledForMutableDefault from "@eGroupAI/hooks/useControlledForMutableDefault";
import useOrgFilterViews from "@eGroupAI/hooks/apis/useOrgFilterViews";
import {
  Value as FilterValue,
  NumberRangeStates,
  Option,
  optionsToValue,
} from "@eGroupAI/material-lab/FilterDropDown";
import NewFilterDropDown from "@eGroupAI/material-lab/FilterDropDown/NewFilterDropDown";
import { optionToValueType } from "@eGroupAI/material-lab/FilterDropDown/utils";

import Typography from "@eGroupAI/material/Typography";
import CheckboxWithLabel from "@eGroupAI/material/CheckboxWithLabel";
import {
  CircularProgress,
  Grid,
  MenuItem,
  useTheme,
  Box,
  Button,
  Stack,
} from "@mui/material";
import { makeStyles, styled } from "@mui/styles";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";

import Badge from "@mui/material/Badge";

import FilterDialog, { DIALOG } from "components/FilterDialog";

import { FilterView, FilterSearch } from "@eGroupAI/typings/apis";
import FilterViewDropDown, {
  FilterViewNewButton,
} from "@eGroupAI/material-lab/FilterView";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { ServiceModuleValue } from "interfaces/utils";
import { isValid } from "@eGroupAI/utils/dateUtils";

import Iconify from "minimal/components/iconify/iconify";
import { useSettingsContext } from "minimal/components/settings";
import clsx from "clsx";

import {
  getFilterValueCountV2,
  compare2FilterObjects,
  compare2FilterValues,
  getParsedFilterValues,
} from "./utils";
import useFilterConditionGroup from "./useFilterConditionGroup";
import {
  DataTableHeaderProps,
  FilterValues,
  TableFilterEvents,
} from "./typing";
import ButtonMenu from "../ButtonMenu";

const useStyles = makeStyles(
  (theme) => ({
    root: {
      "& .MuiEnhancePopover-paper": {
        left: "60px !important",
      },
    },
    header: {
      padding: theme.spacing(1, 1.5),
    },
    filterbar: {
      display: "flex",
      alignItems: "center",
      padding: 15,
      gap: theme.spacing(1),
      overflow: "auto",
      whiteSpace: "nowrap",
      paddingTop: "3px",
      "& button": {
        marginBottom: "10px",
        width: "100%",
        justifyContent: "left",
      },
      "& button .MuiButton-endIcon": {
        position: "absolute",
        right: "21px",
      },
    },
    filterViewDiv: {
      display: "block",
      "& button": {
        marginBottom: "10px",
        width: "100%",
        justifyContent: "left",
      },
      "& button .MuiButton-endIcon": {
        position: "absolute",
        right: "21px",
      },
    },
    loader: {
      position: "absolute",
      padding: 15,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      display: "none",
      alignItems: "flex-start",
      justifyContent: "center",
      zIndex: 9999,
    },
    showLoader: {
      display: "flex",
    },
    lightOpacity: {
      background: "rgba(255,255,255,0.6)",
    },
    darkOpacity: {
      background: "rgba(33, 43, 54, 0.6)",
    },
    selectedToolsbar: {
      display: "flex",
      alignItems: "center",
    },
    searchBar: {
      display: "flex",
      alignItems: "center",

      "& .MuiInputBase-input": {
        minWidth: 150,
      },

      "& .MuiEgMobileTableHeader-searchBar": {
        overFlow: "hidden",
      },
    },
    searchBarInput: {
      minWidth: 200,
    },
    filterDropDown: {
      "& .MuiButton-contained:hover": {
        backgroundColor: `${theme.palette.info.main} !important`,
      },
    },
    columnSelectBtn: {
      marginRight: theme.spacing(1),
    },
    columnSelectCheckbox: {
      width: "100%",
    },
  }),
  {
    name: "MuiEgMobileTableHeader",
  }
);

const StyledBadge = styled(Badge)(({ theme }) => ({
  width: "18px",
  height: "18px",
  "& .MuiBadge-badge": {
    position: "relative",
    left: "3px",
    width: "18px",
    height: "18px",
    lineHeight: "18px",
    alignItem: "center",
    backgroundColor: "#00C7EF",
    color: theme.palette.grey[700],
    transform: "none",
    webkitTransform: "none",
  },
  "& .MuiBadge-badge.MuiBadge-invisible": {
    visibility: "hidden",
  },
}));

const MobileTableHeader = <Data,>(props: DataTableHeaderProps<Data>) => {
  const wordLibrary = useSelector(getWordLibrary);
  const theme = useTheme();
  const classes = useStyles();
  const settings = useSettingsContext();

  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { openDialog } = useReduxDialog(DIALOG);

  const {
    title,
    subTitle,
    selectedToolsbar,
    searchBar,
    payload,
    serviceModuleValue,
    filterConditionGroups,
    TitleTypographyProps,
    SubTitleTypographyProps,
    FilterDropDownProps,
    // SearchBarProps,
    enableSelectColumn,
    columns,
    onColumnChange,
    selectedColumnKeys,
    defaultFilterValues = {},
    filterValues: filterValuesProp,
    onFilterViewSelect,
    onFilterValuesChange,
    onFilterValuesSubmit,
    onFilterValuesClear,
  } = props;

  const {
    data: filterViewsData,
    isValidating,
    mutate,
  } = useOrgFilterViews(
    {
      organizationId,
    },
    { serviceModuleValue }
  );

  const { excute: createFilterView, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createFilterView, "Create");

  const [tableFilterEvent, setTableFilterEvent] = useState<
    TableFilterEvents | undefined
  >(undefined);

  const filterConditionGroup = useFilterConditionGroup(filterConditionGroups);

  const filterConditions = useMemo(
    () =>
      filterConditionGroup?.reduce<Option[]>(
        (a, b) => [...a, ...b.filterConditionList],
        []
      ),
    [filterConditionGroup]
  );

  const [filterValues, setFilterValues] = useControlledForMutableDefault({
    controlled: filterValuesProp,
    default: defaultFilterValues as FilterValues,
  });

  let next = filterValues;

  const [savedFilterValues, setSavedFilterValues] = useState(filterValues);

  const [selectedViewId, setSelectedViewId] = useState<string | undefined>("");
  const [activeViewIds, setActiveViewIds] = useState<string[]>([]);

  const detailedDefaultFilterValues = filterConditionGroup
    ? filterConditionGroup
        .map(({ filterConditionList }, index) => ({
          [index]: filterConditionList
            .map((option) => ({
              [option.filterId]: optionToValueType(option, null, null),
            }))
            .reduce((a, b) => ({ ...a, ...b }), {}),
        }))
        .reduce((a, b) => ({ ...a, ...b }), {})
    : {};

  const defaultNumberRangeStates = useMemo(
    () =>
      filterConditionGroup
        ? filterConditionGroup?.map(({ filterConditionList }, index) =>
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
        : [],
    [filterConditionGroup, savedFilterValues]
  );

  const handleFilterDropDownSave = useCallback(
    (value: FilterValue, i: number) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      next = {
        ...filterValues,
        [i]: value,
      };
      setSavedFilterValues(next);
      if (onFilterValuesChange) {
        onFilterValuesChange(next, i);
      }
      if (FilterDropDownProps?.onChange) {
        FilterDropDownProps.onChange(value);
      }
    },
    [FilterDropDownProps, filterValues, onFilterValuesChange]
  );

  const handleFilterDropDownCancel = useCallback(
    (savedValue: FilterValue, i: number) => {
      if (selectedViewId) return;
      const before = {
        ...filterValues,
        [i]: savedValue,
      };
      setFilterValues(before);
      if (onFilterValuesChange) {
        onFilterValuesChange(before, i);
      }
      if (FilterDropDownProps?.onChange) {
        FilterDropDownProps.onChange(savedValue);
      }
    },
    [
      selectedViewId,
      filterValues,
      setFilterValues,
      FilterDropDownProps,
      onFilterValuesChange,
    ]
  );

  const handleFilterDropDownChange = useCallback(
    (value: FilterValue, i: number) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      next = {
        ...filterValues,
        [i]: value,
      };
      setFilterValues(next);
      if (onFilterValuesChange) {
        onFilterValuesChange(next, i);
      }
      if (FilterDropDownProps?.onChange) {
        FilterDropDownProps.onChange(value);
      }
    },
    [FilterDropDownProps, filterValues, onFilterValuesChange, setFilterValues]
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
      if (onFilterValuesSubmit) {
        onFilterValuesSubmit(next, i);
      }
      if (FilterDropDownProps?.onSubmit) {
        FilterDropDownProps.onSubmit(valueParamToSubmit);
      }
    },
    [FilterDropDownProps, filterValues, onFilterValuesSubmit, setFilterValues]
  );

  const handleFilterDropDownClear = useCallback(
    (e, i: number, options: Option[]) => {
      e.stopPropagation();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      next = {
        ...filterValues,
        [i]: defaultFilterValues[i] as FilterValue,
      };
      setFilterValues(next);
      setSavedFilterValues(next);
      if (FilterDropDownProps?.onClear) {
        FilterDropDownProps.onClear(e, optionsToValue(options, null, null));
      }
      if (onFilterValuesClear) {
        onFilterValuesClear(next, i);
      }
    },
    [
      FilterDropDownProps,
      defaultFilterValues,
      filterValues,
      onFilterValuesClear,
      setFilterValues,
    ]
  );

  const handleSelectFilterView = (filterObject) => {
    setSavedFilterValues(filterObject.filterValues);
    setFilterValues(filterObject.filterValues);
    if (onFilterViewSelect) onFilterViewSelect(filterObject);
  };

  const filterAllClear = useCallback(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    next = defaultFilterValues;
    setFilterValues(next);
    setSavedFilterValues(next);
    if (filterConditionGroup) {
      filterConditionGroup.forEach((el, index) => {
        if (FilterDropDownProps?.onClear) {
          FilterDropDownProps.onClear(
            index as any,
            optionsToValue(el.filterConditionList as Option[], null, null)
          );
        }
      });
    }
    if (onFilterValuesClear) {
      onFilterValuesClear(defaultFilterValues, "all");
    }
  }, [onFilterValuesClear, defaultFilterValues]);

  const renderColumnSelect = () => {
    if (enableSelectColumn) {
      return (
        <ButtonMenu
          button={
            <IconButton size="small">
              <FilterListRoundedIcon />
            </IconButton>
          }
          disableClickOnClose
          placement="bottom-end"
        >
          {columns?.map((el) => (
            <MenuItem key={el.id}>
              <CheckboxWithLabel
                label={el.name}
                className={classes.columnSelectCheckbox}
                MuiCheckboxProps={{
                  onChange: (e, checked) => {
                    if (onColumnChange) {
                      onColumnChange(el, checked);
                    }
                  },
                  checked: selectedColumnKeys?.includes(el.id),
                }}
              />
            </MenuItem>
          ))}
        </ButtonMenu>
      );
    }
    return undefined;
  };

  const renderHeader = (
    <Grid container alignItems="center">
      <Grid item xs={12} container>
        <Grid item>
          {title && (
            <Typography variant="h6" {...TitleTypographyProps}>
              {title}
            </Typography>
          )}
          {subTitle && (
            <Typography variant="body2" {...SubTitleTypographyProps}>
              {subTitle}
            </Typography>
          )}
        </Grid>
        <div style={{ flexGrow: 1 }} />
        <Grid item>
          <div className={classes.selectedToolsbar}>
            {selectedToolsbar}
            {renderColumnSelect()}
          </div>
        </Grid>
      </Grid>
    </Grid>
  );
  const renderFilterDropDown = useCallback(
    (label: string, options: Option[], index: number) => {
      if (!filterValues || !savedFilterValues) return undefined;
      const [filterCountTotal, hasTriggerRange] = getFilterValueCountV2(
        filterValues[index] as FilterValue
      );
      const isActive = filterCountTotal > 0;
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
            size="small"
            component="span"
            onClick={(e) => {
              handleFilterDropDownClear(e, index, options);
              setTableFilterEvent(TableFilterEvents.FILTER_OPTION_CLEAR);
            }}
            sx={{
              padding: "1.5px",
            }}
          >
            <CloseRoundedIcon sx={{ color: theme.palette.grey[300] }} />
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
            {...FilterDropDownProps}
            value={filterValues[index] || {}}
            savedValue={savedFilterValues[index] || {}}
            className={clsx(
              classes.filterDropDown,
              FilterDropDownProps?.className
            )}
            onChange={(value) => handleFilterDropDownChange(value, index)}
            onSubmit={(value) => handleFilterDropDownSubmit(value, index)}
            onClear={(e) => {
              handleFilterDropDownClear(e, index, options);
            }}
            onSave={(value) => handleFilterDropDownSave(value, index)}
            onCancel={(value) => handleFilterDropDownCancel(value, index)}
            options={options}
            endIcon={endIcon}
            selected={isActive}
            selectedNumber={filterCountTotal}
            style={{ width: "100%", marginBottom: "10px" }}
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
      FilterDropDownProps,
      classes.filterDropDown,
      defaultNumberRangeStates,
      filterValues,
      handleFilterDropDownCancel,
      handleFilterDropDownChange,
      handleFilterDropDownClear,
      handleFilterDropDownSave,
      handleFilterDropDownSubmit,
      savedFilterValues,
      theme.palette.grey,
    ]
  );

  const fetchViewsAfterUpdate = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleDeleteFilterView = useCallback(
    () => {
      mutate();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate]
  );

  const filterObjectFromPayload: FilterSearch | undefined = useMemo(() => {
    if (payload) {
      const { startIndex, size, equal, range } = payload;
      return {
        startIndex: startIndex as number,
        size: size as number,
        equal: equal
          ? Object.keys(equal).map((key) => {
              const filter = filterConditions?.find(
                (el) => el.filterId === key
              );
              return {
                filterKey: filter?.filterKey || "",
                value: equal[key],
                columnId: filter?.columnId || "",
                type: filter?.type,
              };
            })
          : [],
        range: range
          ? Object.keys(range).map((key) => {
              const filter = filterConditions?.find(
                (el) => el.filterId === key
              );

              if (
                isValid(new Date(String(range[key][0]))) &&
                isValid(new Date(String(range[key][1])))
              )
                return {
                  filterKey: filter?.filterKey || "",
                  from: new Date(range[key][0]).toISOString(),
                  to: new Date(range[key][1]).toISOString(),
                  columnId: filter?.columnId || "",
                  type: filter?.type,
                };
              return {
                filterKey: filter?.filterKey || "",
                from: Number(range[key][0]),
                to: Number(range[key][1]),
                columnId: filter?.columnId || "",
                type: filter?.type,
              };
            })
          : [],
        locale,
      };
    }
    return undefined;
  }, [filterConditions, locale, payload]);

  const [isAbleToAddNewView, setIsAbleToAddNewView] = useState<boolean>(
    !compare2FilterValues(
      getParsedFilterValues(filterValues),
      defaultFilterValues
    ) ||
      filterObjectFromPayload?.startIndex !== 0 ||
      filterObjectFromPayload?.size !== 10
  );

  useEffect(() => {
    const comparedWithDefault = compare2FilterValues(
      getParsedFilterValues(filterValues),
      defaultFilterValues
    );
    if (
      (comparedWithDefault &&
        tableFilterEvent === TableFilterEvents.FILTER_OPTION_CLEAR) ||
      (comparedWithDefault &&
        filterObjectFromPayload?.startIndex === 0 &&
        filterObjectFromPayload?.size === 10)
    )
      setSelectedViewId(undefined);
    if (
      !comparedWithDefault ||
      filterObjectFromPayload?.startIndex !== 0 ||
      filterObjectFromPayload?.size !== 10
    )
      setIsAbleToAddNewView(true);
    else setIsAbleToAddNewView(false);
  }, [
    filterValues,
    defaultFilterValues,
    filterObjectFromPayload?.startIndex,
    filterObjectFromPayload?.size,
    tableFilterEvent,
  ]);

  useEffect(() => {
    if (filterViewsData && filterObjectFromPayload) {
      const activeViews =
        filterViewsData?.filter((view) =>
          compare2FilterObjects(
            view.filterObject as FilterSearch,
            filterObjectFromPayload as FilterSearch
          )
        ) || [];
      if (activeViews.length > 0) {
        setActiveViewIds(activeViews.map((view) => view.filterViewId));
      } else setActiveViewIds([]);
    }
  }, [filterViewsData, filterObjectFromPayload]);

  const renderFilterView = (view: FilterView) => (
    <Box key={view.filterViewId}>
      <FilterViewDropDown
        key={view.filterViewId}
        isActive={activeViewIds.includes(view.filterViewId)}
        selectedViewId={selectedViewId}
        setSelectedViewId={setSelectedViewId}
        viewName={view.filterViewName}
        viewId={view.filterViewId}
        viewNo={view.filterViewNo}
        isPublic={view.isPublic}
        organizationId={view.organization.organizationId}
        loginId={view.creator.loginId}
        filterObject={view.filterObject}
        filterObjectFromPayload={filterObjectFromPayload}
        filterOptionGroups={filterConditionGroup}
        onSetFilterView={handleSelectFilterView}
        onDeleteView={handleDeleteFilterView}
        onMutate={fetchViewsAfterUpdate}
        serviceModuleValue={serviceModuleValue}
        setTableFilterEvent={setTableFilterEvent}
      />
    </Box>
  );

  const handleSaveNewView = () => {
    if (filterObjectFromPayload) {
      const filterViewApiPayload = {
        organizationId,
        serviceModuleValue: serviceModuleValue as ServiceModuleValue,
        filterObject: filterObjectFromPayload as FilterSearch,
      };
      createFilterView(filterViewApiPayload)
        .then((res) => {
          setActiveViewIds([]);
          setSelectedViewId(res.data.filterViewId);
          mutate();
        })
        .catch(() => {});
    }
  };

  const renderFilterbar = filterConditionGroup ? (
    <div className={classes.filterbar} style={{ display: "block" }}>
      {filterConditionGroup.map((el, index) =>
        renderFilterDropDown(
          el.filterConditionGroupName,
          el.filterConditionList,
          index
        )
      )}
      {serviceModuleValue &&
        filterConditionGroup.length > 0 &&
        filterViewsData && (
          <div
            style={{
              position: "relative",
              padding: 0,
            }}
            className={classes.filterViewDiv}
          >
            <div
              className={clsx(
                classes.loader,
                isValidating && classes.showLoader,
                {
                  [classes.lightOpacity]: settings.themeMode === "light",
                  [classes.darkOpacity]: settings.themeMode !== "light",
                }
              )}
            >
              <CircularProgress />
            </div>
            {filterViewsData?.map((el) => renderFilterView(el))}
            <FilterViewNewButton
              btnName={
                wordLibrary?.["save filter conditions"] ?? "儲存篩選條件"
              }
              ableToAdd={isAbleToAddNewView && activeViewIds.length === 0}
              onClick={handleSaveNewView}
              isSaving={isCreating}
            />
          </div>
        )}
    </div>
  ) : undefined;

  let filterCountTotal = 0;
  if (filterValues) {
    filterCountTotal = Object.keys(filterValues).reduce<number>(
      (a, b) => a + getFilterValueCountV2(filterValues[b])[0],
      0
    );
  }
  return (
    <Box
      sx={{
        padding: "8px 8px 20px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Button
        variant="text"
        size="small"
        onClick={openDialog}
        style={{
          display:
            Object.keys(detailedDefaultFilterValues).length === 0
              ? "none"
              : "flex",
        }}
        sx={{ padding: 0 }}
      >
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Iconify icon="ic:round-filter-alt" color="text.primary" width={24} />
          <Typography color="text.primary">篩選器</Typography>
          <StyledBadge badgeContent={filterCountTotal} />
        </Stack>
      </Button>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex" }} alignItems="center">
          {renderHeader}
        </Box>
        {searchBar}
      </Box>
      <FilterDialog
        renderFilterbar={renderFilterbar}
        filterAllClear={filterAllClear}
        filterCountTotal={filterCountTotal}
      />
    </Box>
  );
};

export default MobileTableHeader;
