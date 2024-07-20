import React, { useCallback, useContext, useMemo } from "react";
import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { Controller, useFormContext } from "react-hook-form";
import Iconify from "minimal/components/iconify";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { OrgChartReportFormInput } from "interfaces/form";
import useFilterConditionGroup from "@eGroupAI/material-module/DataTable/useFilterConditionGroup";
import { Item, Option, ValueType } from "@eGroupAI/material-lab/FilterDropDown";
import { optionToValueType } from "@eGroupAI/material-lab/FilterDropDown/utils";
import { toDate, format, DateVariant } from "@eGroupAI/utils/dateUtils";
import { DateRange } from "@eGroupAI/material-lab/DateRangePicker/types";

import OrgChartReportDialogContext from "./OrgChartReportDialogContext";
import FilterOptionCheckboxWithLabel from "./FilterOptionCheckboxWithLabel";
import FilterOptionDateTimeRangePicker from "./FilterOptionDateTimeRangePicker";
import FilterOptionNumberRange from "./FilterOptionNumberRange";
import FilterOptionChoiceMultiText from "./FilterOptionChoiceMultiText";

export interface FormSectionFilterProps {
  index: number;
  onRemove?: (index: number) => void;
  onChange?: (value: Option | null) => void;
}

export interface InputCheckboxRefsType {
  [id: string]: HTMLInputElement;
}

const useStyles = makeStyles((theme) => ({
  checkbox: {
    "&.MuiFormControlLabel-root": {
      margin: 0,
    },
    "& .MuiTypography-root": {},
    "& span.MuiCheckbox-root": {
      padding: "2px",
      margin: "0px 4px",
    },
  },
  numberRange: {
    padding: theme.spacing(0, 1),
    width: "100%",
  },
  multiText: {
    paddingTop: theme.spacing(1),
    width: "100%",
  },
}));

const FormSectionFilter = (props: FormSectionFilterProps) => {
  const { index, onRemove, onChange } = props;
  const classes = useStyles();

  const wordLibrary = useSelector(getWordLibrary);

  const { control, watch, setValue } =
    useFormContext<OrgChartReportFormInput>();
  const filterConditions = watch(`filterConditions`);
  const selectedFilterValuesForOthers = filterConditions
    .map((v) => v.filterId || "")
    .filter((_, i) => index !== i);
  const filterCondition = watch(`filterConditions.${index}`);

  const { filterConditionGroups } = useContext(OrgChartReportDialogContext);
  let filterConditionGroup = useFilterConditionGroup(filterConditionGroups);
  const reportVariables = watch("reportVariables");

  const v1 = reportVariables[0];
  const v2 = reportVariables[1];
  if (
    (v1?.mode === "TAG" && v1?.name === "All tags") ||
    (v2?.mode === "TAG" && v2?.name === "All tags")
  ) {
    filterConditionGroup = filterConditionGroup?.filter(
      (fConditionGroup) => fConditionGroup.filterConditionGroupName === "TAG"
    );
  }
  const filterConditionListOptions = useMemo(
    () =>
      filterConditionGroup?.reduce<Option[]>((a, b, index) => {
        const list = b.filterConditionList.map((fCondition) => ({
          ...fCondition,
          filterGroupName: b.filterConditionGroupName,
          filterGroupIndex: index,
        }));
        const filteredList = list.filter(
          (l) => !selectedFilterValuesForOthers.includes(l.filterId)
        );
        return [...a, ...filteredList];
      }, []),
    [filterConditionGroup, selectedFilterValuesForOthers]
  );

  const renderFilterOptions = useCallback(() => {
    const { type, filterId, items, filterValue } = filterCondition;
    const controlledValue = optionToValueType(filterCondition, null, null);

    switch (type) {
      case "CHOICEMULTI":
        return items?.map((item) => (
          <Controller
            control={control}
            name={`filterConditions.${index}.filterValue`}
            render={() => (
              <FilterOptionCheckboxWithLabel
                className={classes.checkbox}
                key={item.value}
                label={item.label}
                value={item.value}
                name={filterId}
                defaultChecked={(controlledValue as string[]).includes(
                  item.value
                )}
                checked={((filterValue as string[]) || []).includes(item.value)}
                MuiCheckboxProps={{
                  color: "primary",
                }}
                onChange={(e, checked) => {
                  if (
                    item.value === "EGROUP_EMPTY" &&
                    item.label === "無資料"
                  ) {
                    if (checked) {
                      setValue(`filterConditions.${index}.filterValue`, [
                        item.value as string,
                      ]);
                    } else {
                      setValue(`filterConditions.${index}.filterValue`, []);
                    }
                  } else if (checked) {
                    const newV = [...((filterValue as string[]) || [])];
                    const filtered = newV.filter((v) => v !== "EGROUP_EMPTY");
                    if (!filtered.includes(item.value))
                      filtered.push(item.value);
                    setValue(`filterConditions.${index}.filterValue`, filtered);
                  } else {
                    const newV = [...((filterValue as string[]) || [])];
                    let filtered = newV;
                    if (newV.includes(item.value))
                      filtered = newV.filter((v) => v !== item.value);
                    setValue(`filterConditions.${index}.filterValue`, filtered);
                  }
                }}
              />
            )}
          />
        ));
      case "DATETIME_RANGE":
        return (
          <Controller
            control={control}
            name={`filterConditions.${index}.filterValue`}
            render={() => (
              <FilterOptionDateTimeRangePicker
                showTime
                defaultStartDate={
                  toDate(filterValue?.[0] as DateVariant) as Date
                }
                defaultStartTime={format(
                  filterValue?.[0] as DateVariant,
                  "HH:mm"
                )}
                defaultEndDate={toDate(filterValue?.[1] as DateVariant) as Date}
                defaultEndTime={format(
                  filterValue?.[1] as DateVariant,
                  "HH:mm"
                )}
                variant="standard"
                size="small"
                fullWidth
                name={filterId}
                onChange={(dateRange: DateRange) => {
                  const fromDate = dateRange[0];
                  const toDate = dateRange[1];
                  setValue(`filterConditions.${index}.filterValue`, [
                    (fromDate as Date) || null,
                    (toDate as Date) || null,
                  ]);
                }}
              />
            )}
          />
        );
      case "DATE_RANGE":
        return (
          <Controller
            control={control}
            name={`filterConditions.${index}.filterValue`}
            render={() => (
              <FilterOptionDateTimeRangePicker
                defaultStartDate={
                  toDate(filterValue?.[0] as DateVariant) as Date
                }
                defaultEndDate={toDate(filterValue?.[1] as DateVariant) as Date}
                variant="standard"
                size="small"
                fullWidth
                name={filterId}
                onChange={(dateRange: DateRange) => {
                  const fromDate = dateRange[0];
                  const toDate = dateRange[1];
                  setValue(`filterConditions.${index}.filterValue`, [
                    (fromDate as Date) || null,
                    (toDate as Date) || null,
                  ]);
                }}
              />
            )}
          />
        );
      case "NUMBER_RANGE":
        return (
          <Controller
            control={control}
            name={`filterConditions.${index}.filterValue`}
            render={() => (
              <FilterOptionNumberRange
                className={classes.numberRange}
                valueLabelDisplay="auto"
                name={filterId}
                defaultValue={controlledValue as number[] | undefined}
                showSliderBar={false}
                onChange={(numberRange: ValueType) => {
                  setValue(`filterConditions.${index}.filterValue`, [
                    (numberRange as number[])[0] || null,
                    (numberRange as number[])[1] || null,
                  ]);
                }}
              />
            )}
          />
        );
      case "CHOICEMULTI_TEXT":
        return (
          <Controller
            control={control}
            name={`filterConditions.${index}.filterValue`}
            render={() => (
              <FilterOptionChoiceMultiText
                className={classes.multiText}
                items={items}
                name={filterId}
                defaultValue={controlledValue as Item[]}
                onChange={(value: ValueType) => {
                  // if (
                  //   item.value === "EGROUP_EMPTY" &&
                  //   item.label === "無資料"
                  // ) {
                  //   if (checked) {
                  //     setValue(`filterConditions.${index}.filterValue`, [
                  //       item.value as string,
                  //     ]);
                  //   } else {
                  //     setValue(`filterConditions.${index}.filterValue`, []);
                  //   }
                  // } else if (checked) {
                  //   const newV = [...((filterValue as string[]) || [])];
                  //   const filtered = newV.filter((v) => v !== "EGROUP_EMPTY");
                  //   if (!filtered.includes(item.value))
                  //     filtered.push(item.value);
                  //   setValue(`filterConditions.${index}.filterValue`, filtered);
                  // } else {
                  //   const newV = [...((filterValue as string[]) || [])];
                  //   let filtered = newV;
                  //   if (newV.includes(item.value))
                  //     filtered = newV.filter((v) => v !== item.value);
                  //   setValue(`filterConditions.${index}.filterValue`, filtered);
                  // }
                  setValue(
                    `filterConditions.${index}.filterValue`,
                    value as Item[]
                  );
                }}
              />
            )}
          />
        );
      default:
        return undefined;
    }
  }, [
    classes.checkbox,
    classes.multiText,
    classes.numberRange,
    control,
    filterCondition,
    index,
    setValue,
  ]);

  return (
    <Box>
      <Grid item xs={12}>
        <Controller
          control={control}
          name={`filterConditions.${index}`}
          render={() => (
            <Autocomplete
              id="report-form-select-filter"
              data-tid="report-form-select-filter"
              size="medium"
              options={filterConditionListOptions || []}
              defaultValue={filterConditionListOptions?.find(
                (item) => item?.columnId === filterCondition?.columnId
              )}
              value={filterConditionListOptions?.find(
                (option) => option?.columnId === filterCondition?.columnId
              )}
              renderInput={({ InputProps, ...others }) => (
                <TextField
                  variant="outlined"
                  // label={label}
                  placeholder={wordLibrary?.["all conditions"] ?? "請選擇條件"}
                  InputProps={{
                    ...InputProps,
                    // startAdornment: isCreatingNewGroup && (
                    //   <CircularProgress size={20} sx={{ mr: 1 }} />
                    // ),
                  }}
                  {...others}
                />
              )}
              noOptionsText="查無欄位群組"
              getOptionLabel={(option) => option.filterName}
              isOptionEqualToValue={(option, value) =>
                option?.columnId === value?.columnId
              }
              groupBy={(option) => option?.filterGroupName || ""}
              filterOptions={(options, state) => {
                if (state.inputValue)
                  return options.filter((o) =>
                    o.filterName?.includes(state.inputValue)
                  );
                return options;
              }}
              onChange={(event, newOption) => {
                if (onChange) {
                  if (newOption) onChange(newOption);
                  else onChange(null);
                }
              }}
            />
          )}
        />
      </Grid>
      <Grid
        item
        xs={12}
        spacing={1}
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          flexWrap: "wrap",
          "&:has(*)": { mt: 3 },
        }}
      >
        {renderFilterOptions()}
      </Grid>

      {filterConditions.length > 1 && (
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
        >
          <Button
            variant="text"
            size="small"
            color="error"
            startIcon={<Iconify icon="solar:trash-bin-minimalistic-bold" />}
            onClick={() => {
              if (onRemove) onRemove(index);
            }}
          >
            {wordLibrary?.remove ?? "Remove"}
          </Button>
        </Grid>
      )}
    </Box>
  );
};

export default FormSectionFilter;
