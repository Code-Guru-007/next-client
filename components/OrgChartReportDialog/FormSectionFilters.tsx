import React, { useRef } from "react";
import {
  Box,
  Button,
  // FormControl,
  // FormControlLabel,
  Grid,
  // Radio,
  // RadioGroup,
} from "@mui/material";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
// import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { OrgChartReportFormInput } from "interfaces/form";

// import { FilterConditionsTypes } from "@eGroupAI/typings/apis";

import Iconify from "minimal/components/iconify";

import FormSectionFilter from "./FormSectionFilter";
import FormSection from "./FormSection";
import FormSectionTitle from "./FormSectionTitle";
// import { intlFilterConditionsTypes } from "./types";

export interface FormSectionFiltersProps {
  maxItems?: number;
}

const FormSectionFilters = function (props: FormSectionFiltersProps) {
  const { maxItems } = props;
  // const locale = useSelector(getGlobalLocale);

  const wordLibrary = useSelector(getWordLibrary);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const { control, watch, setValue } =
    useFormContext<OrgChartReportFormInput>();
  const { append, remove } = useFieldArray({
    control,
    name: "filterConditions",
  });

  const filterConditions = watch("filterConditions");
  const addAble = maxItems ? filterConditions.length < maxItems : true;
  // const filterConditionsType = watch("filterConditionsType");

  return (
    <FormSection>
      <FormSectionTitle>
        {wordLibrary?.["filter conditions"] ?? "篩選條件"}
      </FormSectionTitle>
      <Box>
        <Grid container spacing={3}>
          {filterConditions.map((filterCondition, index) => (
            <Grid item xs={12}>
              <FormSectionFilter
                key={`filter-${index}-${filterCondition?.columnId}`}
                index={index}
                onRemove={(index) => remove(index)}
                onChange={(value) => {
                  if (value) setValue(`filterConditions.${index}`, value);
                  else
                    setValue(`filterConditions.${index}`, {
                      filterId: "",
                      filterGroupName: "",
                      filterKey: "",
                      columnId: "",
                      filterName: "",
                      type: "",
                    });
                }}
              />
            </Grid>
          ))}
          {addAble && (
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                ref={addBtnRef}
                variant="text"
                color="primary"
                onClick={() => {
                  append({
                    filterId: "",
                    filterGroupName: "",
                    filterKey: "",
                    columnId: "",
                    filterName: "",
                    type: "",
                  });
                  setTimeout(() => {
                    addBtnRef?.current?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                sx={{ mt: 3 }}
                id="report-form-filter-new-button"
                data-tid="report-form-filter-new-button"
              >
                {wordLibrary?.["New session"] ?? "+ 新增條件"}
              </Button>
            </Grid>
          )}
          {filterConditions.length > 1 && (
            <>
              {/* <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <Controller
                  control={control}
                  name="filterConditionsType"
                  render={() => (
                    <FormControl sx={{ width: "100%", ml: 1 }}>
                      <RadioGroup
                        row
                        value={filterConditionsType}
                        onChange={(e) => {
                          setValue(
                            "filterConditionsType",
                            FilterConditionsTypes?.[`${e.target.value}`]
                          );
                        }}
                      >
                        {Object.keys(FilterConditionsTypes).map((key) => (
                          <FormControlLabel
                            key={FilterConditionsTypes[key]}
                            control={<Radio />}
                            value={FilterConditionsTypes[key]}
                            label={
                              wordLibrary?.[
                              `filter type ${FilterConditionsTypes[key]}`
                              ] ??
                              intlFilterConditionsTypes?.[`${locale}`]?.[
                              `${key}`
                              ]
                            }
                            sx={{ mr: 5 }}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Grid> */}
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-start" }}
              >
                <Button
                  variant="text"
                  color="error"
                  startIcon={
                    <Iconify icon="solar:trash-bin-minimalistic-bold" />
                  }
                  onClick={() => {
                    setValue("filterConditions", [
                      {
                        filterId: "",
                        filterGroupName: "",
                        filterKey: "",
                        columnId: "",
                        filterName: "",
                        type: "",
                      },
                    ]);
                  }}
                >
                  {wordLibrary?.["clear all"] ?? "Clear All"}
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </FormSection>
  );
};

export default FormSectionFilters;
