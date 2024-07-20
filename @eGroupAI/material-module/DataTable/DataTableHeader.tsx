import React, { useCallback, useEffect, useState, useMemo } from "react";

import useControlledForMutableDefault from "@eGroupAI/hooks/useControlledForMutableDefault";
import {
  Value as FilterValue,
  NumberRangeStates,
  Option,
} from "@eGroupAI/material-lab/FilterDropDown";
import NewFilterDropDown from "@eGroupAI/material-lab/FilterDropDown/NewFilterDropDown";
import {
  optionToValueType,
  optionsToValue,
} from "@eGroupAI/material-lab/FilterDropDown/utils";

import Typography from "@eGroupAI/material/Typography";
import Button from "@eGroupAI/material/Button";
import CheckboxWithLabel from "@eGroupAI/material/CheckboxWithLabel";
import { Box, Grid, useTheme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import IconButton from "@eGroupAI/material/IconButton";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { FilterView, FilterSearch } from "@eGroupAI/typings/apis";
import FilterViewDropDown, {
  FilterViewNewButton,
} from "@eGroupAI/material-lab/FilterView";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import apis from "utils/apis";
import useGetFilterViews from "@eGroupAI/hooks/apis/useGetFilterViews";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { ServiceModuleValue } from "interfaces/utils";
import { isValid } from "@eGroupAI/utils/dateUtils";
import Menu from "components/Menu";
import MenuItem from "components/MenuItem";

import clsx from "clsx";
import { useSettingsContext } from "minimal/components/settings";
import Scrollbar from "minimal/components/scrollbar/scrollbar";

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

const useStyles = makeStyles(
  (theme) => ({
    root: {},
    header: {
      padding: theme.spacing(0, 1),
    },
    filterbar: {
      display: "flex",
      alignItems: "center",
      backgroundColor: theme.palette.background.paper,
      gap: theme.spacing(1),
      whiteSpace: "nowrap",
      paddingTop: "3px",
    },
    filterViewDiv: {
      display: "flex",
      alignItems: "center",
      backgroundColor: theme.palette.background.paper,
      gap: theme.spacing(0, 1),
      padding: "0px 15px",
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

      "& .MuiEgDataTableHeader-searchBar": {
        overFlow: "hidden",
      },
    },
    menuPopover: {
      "& .MuiPopover-paper": {
        marginTop: 10,
        boxShadow:
          "rgba(145, 158, 171, 0.24) 0px 0px 2px 0px, rgba(145, 158, 171, 0.24) -20px 20px 40px -4px;",
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
    filterWrapper: {
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 10px 20px",
    },
  }),
  {
    name: "MuiEgDataTableHeader",
  }
);

const DataTableHeader = <Data,>(props: DataTableHeaderProps<Data>) => {
  const wordLibrary = useSelector(getWordLibrary);
  const theme = useTheme();
  const classes = useStyles();
  const settings = useSettingsContext();

  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);

  const {
    className,
    title,
    subTitle,
    selectedToolsbar,
    payload,
    serviceModuleValue,
    filterConditionGroups,
    TitleTypographyProps,
    SubTitleTypographyProps,
    FilterDropDownProps,
    enableSelectColumn,
    localization,
    columns,
    onColumnChange,
    selectedColumnKeys,
    defaultFilterValues = {},
    filterValues: filterValuesProp,
    onFilterViewSelect,
    onFilterValuesChange,
    onFilterValuesSubmit,
    onFilterValuesClear,
    enableFilter = false,
    ...other
  } = props;

  const [tableFilterEvent, setTableFilterEvent] = useState<
    TableFilterEvents | undefined
  >(undefined);

  const [isOpenMenu, setIsOpenMenu] = useState<null | HTMLElement>(null);

  const {
    data: filterViews,
    mutate,
    isValidating,
  } = useGetFilterViews(
    { organizationId },
    { serviceModuleValue },
    undefined,
    !serviceModuleValue || !enableFilter
  );

  const { excute: createFilterView, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createFilterView, "Create");

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

  const detailedDefaultFilterValuesGrouped = useMemo(
    () =>
      filterConditionGroup
        ? filterConditionGroup
            .map(({ filterConditionList }, index) => ({
              [index]: filterConditionList
                .map((option) => ({
                  [option.filterId]: optionToValueType(option, null, null),
                }))
                .reduce((a, b) => ({ ...a, ...b }), {}),
            }))
            .reduce((a, b) => ({ ...a, ...b }), {})
        : {},
    [filterConditionGroup]
  );

  const [savedFilterValues, setSavedFilterValues] = useState(filterValues);

  const [selectedViewId, setSelectedViewId] = useState<string | undefined>("");
  const [activeViewIds, setActiveViewIds] = useState<string[]>([]);

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
      const next = {
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

  const handleFilterDropDownSubmit = useCallback(
    (value: FilterValue, i: number) => {
      const next = {
        ...filterValues,
        [i]: value,
      };

      const valueParamToSubmit = {
        ...detailedDefaultFilterValuesGrouped[i],
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
    [
      FilterDropDownProps,
      detailedDefaultFilterValuesGrouped,
      filterValues,
      onFilterValuesSubmit,
      setFilterValues,
    ]
  );

  const handleFilterDropDownClear = useCallback(
    (e, i: number, options: Option[]) => {
      e.stopPropagation();
      const next = {
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

  const renderColumnSelect = () => {
    if (enableSelectColumn) {
      return (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={(event) => {
              setIsOpenMenu(event.currentTarget);
            }}
          >
            {localization?.columnSelectBtn}
          </Button>
          <Menu
            className={classes.menuPopover}
            anchorEl={isOpenMenu}
            open={Boolean(isOpenMenu)}
            onClose={() => {
              setIsOpenMenu(null);
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {columns?.map((el) => (
              <MenuItem key={el.id} sx={{ paddingLeft: 3 }}>
                <CheckboxWithLabel
                  label={el.name}
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
          </Menu>
        </>
      );
    }
    return undefined;
  };

  const renderHeader = () => {
    if (!selectedToolsbar && !filterConditionGroup) {
      return (
        <Grid container alignItems="center">
          <Grid item xs={12} container>
            <Grid item>
              {title && (
                <Typography variant="h4" {...TitleTypographyProps}>
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
              <div className={classes.searchBar}>{renderColumnSelect()}</div>
            </Grid>
          </Grid>
        </Grid>
      );
    }
    return (
      <Grid container alignItems="center">
        <Grid item xs={12} container>
          <Grid item>
            {title && (
              <Typography variant="h4" {...TitleTypographyProps}>
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
            <div className={classes.selectedToolsbar}>{selectedToolsbar}</div>
          </Grid>
        </Grid>
      </Grid>
    );
  };

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
              setTableFilterEvent(TableFilterEvents.FILTER_OPTION_CLEAR);
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
            id={`filter-condition-${label}`}
            data-tid={`filter-condition-${label}`}
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
      handleFilterDropDownClear,
      handleFilterDropDownSave,
      handleFilterDropDownSubmit,
      savedFilterValues,
      theme.palette.grey,
    ]
  );

  const fetchViewsAfterUpdate = useCallback(async () => {
    mutate();
  }, [mutate]);

  const handleDeleteFilterView = useCallback(async () => {
    mutate();
  }, [mutate]);

  const handleSelectFilterView = useCallback(
    (filterObject, toogleUnSelect?: boolean) => {
      if (toogleUnSelect === true) {
        const clearedFilterObject = {
          ...filterObject,
          equal: {},
          range: {},
          filterValues: defaultFilterValues,
        };
        setSavedFilterValues(defaultFilterValues);
        setFilterValues(defaultFilterValues);
        if (onFilterViewSelect) onFilterViewSelect(clearedFilterObject);
      } else {
        setSavedFilterValues(filterObject.filterValues);
        setFilterValues(filterObject.filterValues);
        if (onFilterViewSelect) onFilterViewSelect(filterObject);
      }
    },
    [defaultFilterValues, onFilterViewSelect, setFilterValues]
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
    if (filterViews && filterObjectFromPayload) {
      const activeViews =
        filterViews?.filter((view) =>
          compare2FilterObjects(
            view.filterObject as FilterSearch,
            filterObjectFromPayload as FilterSearch
          )
        ) || [];
      if (activeViews.length > 0) {
        setActiveViewIds(activeViews.map((view) => view.filterViewId));
      } else setActiveViewIds([]);
    }
  }, [filterObjectFromPayload, filterViews]);

  const renderFilterView = useCallback(
    (view: FilterView) => (
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
    ),

    [
      activeViewIds,
      fetchViewsAfterUpdate,
      filterConditionGroup,
      filterObjectFromPayload,
      handleDeleteFilterView,
      handleSelectFilterView,
      selectedViewId,
      serviceModuleValue,
    ]
  );

  const handleSaveNewView = useCallback(() => {
    if (filterObjectFromPayload) {
      const viewNameArray: (string | undefined)[] = [];
      // eslint-disable-next-line array-callback-return
      filterConditionGroup?.find((item) => {
        // eslint-disable-next-line array-callback-return
        item.filterConditionList?.find((i) => {
          const matchingColumn = filterObjectFromPayload.equal?.find(
            (item2) => i.columnId === item2.columnId
          );

          if (matchingColumn) {
            const matchingValues =
              i.items?.filter((item3) =>
                matchingColumn.value?.some(
                  (valueItem) => item3.value === valueItem
                )
              ) || [];
            if (matchingValues.length > 0) {
              matchingValues.forEach((i) => {
                viewNameArray.push(i.label);
              });
            } else {
              viewNameArray.push(undefined);
            }
          }
        });
      });
      const filteredViewNameArray = viewNameArray.filter(
        (value) => value && value.trim() !== ""
      );

      const resultName = filteredViewNameArray.join("-");

      const filterViewApiPayload = {
        organizationId,
        serviceModuleValue: serviceModuleValue as ServiceModuleValue,
        filterObject: filterObjectFromPayload as FilterSearch,
        filterViewName: resultName as string,
      };
      createFilterView(filterViewApiPayload)
        .then(async (res) => {
          setActiveViewIds([]);
          setSelectedViewId(res.data.filterViewId);
          mutate();
        })
        .catch(() => {});
    }
  }, [
    filterObjectFromPayload,
    filterConditionGroup,
    organizationId,
    serviceModuleValue,
    createFilterView,
    mutate,
  ]);
  const renderFilterbar = useMemo(() => {
    if (filterConditionGroup) {
      return (
        <Scrollbar sx={{ height: "50px" }}>
          <div
            className={clsx(
              classes.filterbar,
              "tour_target-data_table-header-filterGroups"
            )}
          >
            {filterConditionGroup.map((el, index) =>
              renderFilterDropDown(
                el.filterConditionGroupName,
                el.filterConditionList,
                index
              )
            )}
            {serviceModuleValue &&
              filterConditionGroup.length > 0 &&
              filterViews && (
                <div
                  style={{ position: "relative" }}
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
                  />
                  {filterViews?.map((el) => renderFilterView(el))}
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
            <div style={{ flexGrow: 1 }} />
          </div>
        </Scrollbar>
      );
    }
    return undefined;
  }, [
    filterConditionGroup,
    classes.filterbar,
    classes.filterViewDiv,
    classes.loader,
    classes.showLoader,
    classes.lightOpacity,
    classes.darkOpacity,
    serviceModuleValue,
    filterViews,
    isValidating,
    settings.themeMode,
    wordLibrary,
    isAbleToAddNewView,
    activeViewIds.length,
    handleSaveNewView,
    isCreating,
    renderFilterDropDown,
    renderFilterView,
  ]);

  return (
    <Box className={clsx(className, classes.root)} {...other}>
      <Box className={classes.header}>{renderHeader()}</Box>
      {enableFilter && filterConditionGroup && filterConditionGroup.length > 0 && (
        <div className={classes.filterWrapper}>
          {renderFilterbar}
          <div className={classes.searchBar}>{renderColumnSelect()}</div>
        </div>
      )}
    </Box>
  );
};

export default DataTableHeader;
