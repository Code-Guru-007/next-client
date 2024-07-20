import React, { useEffect, useState } from "react";
import {
  Box,
  // Button,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import { ChartTypes } from "@eGroupAI/typings/apis";
import { Controller, useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { OrgChartReportFormInput } from "interfaces/form";
import FormSection from "./FormSection";
import FormSectionTitle from "./FormSectionTitle";

import { intlChartType } from "./types";

const FormSectionChartType = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const locale = useSelector(getGlobalLocale);

  const chartTypes = Object.values(ChartTypes);
  const { control, setValue, watch } =
    useFormContext<OrgChartReportFormInput>();
  const chartType = watch("reportChartType");
  const reportVariables = watch("reportVariables");

  const v1 = reportVariables[0];
  const v2 = reportVariables[1];

  const [disabledChartTypes, setDisabledChartTypes] = useState<ChartTypes[]>(
    []
  );

  useEffect(() => {
    let fixedType: ChartTypes = ChartTypes.PIE;
    let disabledTypes: ChartTypes[] = [];
    if (v1?.value && !v2?.value) {
      fixedType = ChartTypes.PIE;
      disabledTypes = [ChartTypes.LINE];
      if (v1?.columnType?.includes("DATE")) {
        fixedType = ChartTypes.LINE;
        disabledTypes = [ChartTypes.BAR, ChartTypes.PIE];
      }
    }
    if (v1?.value && v2?.value) {
      fixedType = ChartTypes.BAR;
      disabledTypes = [ChartTypes.LINE, ChartTypes.PIE];
      if (
        v1?.columnType?.includes("DATE") ||
        v2?.columnType?.includes("DATE")
      ) {
        fixedType = ChartTypes.LINE;
        disabledTypes = [ChartTypes.BAR, ChartTypes.PIE];
      }
    }
    if (v1?.mode?.toLowerCase() === "action") {
      fixedType = ChartTypes.BAR;
      disabledTypes = [ChartTypes.LINE, ChartTypes.PIE];
    }
    if (disabledTypes.includes(chartType.type1 as ChartTypes))
      setValue("reportChartType.type1", fixedType);
    setDisabledChartTypes(disabledTypes);
  }, [chartType.type1, setValue, v1, v2]);

  return (
    <FormSection>
      <FormSectionTitle>
        {wordLibrary?.["chart type"] ?? "報表類型"}
      </FormSectionTitle>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="reportChartType.type1"
              render={({ field: { onChange } }) => (
                <TextField
                  select
                  fullWidth
                  value={chartType.type1}
                  onChange={(e) => {
                    onChange(e);
                  }}
                  id="report-form-chart-type-select"
                  data-tid="report-form-chart-type-select"
                >
                  {chartTypes.map((chartType) => (
                    <MenuItem
                      id={`report-form-select-chartType-${chartType.toLowerCase()}`}
                      data-tid={`report-form-select-chartType-${chartType.toLowerCase()}`}
                      key={chartType}
                      value={chartType}
                      disabled={disabledChartTypes.includes(chartType)}
                    >
                      {wordLibrary?.chartType ??
                        intlChartType?.[`${locale}`]?.[
                          `${chartType.toUpperCase()}`
                        ]}
                    </MenuItem>
                  ))}
                  {/* <Button
                    variant="text"
                    fullWidth
                    sx={{
                      justifyContent: "start",
                    }}
                    onClick={() => {
                      setValue("chartType.type1", undefined);
                    }}
                  >
                    {wordLibrary?.clear ?? "清除"}
                  </Button> */}
                </TextField>
              )}
            />
          </Grid>
          {/* <Grid item xs={12}>
            <Controller
              control={control}
              name="chartType.type2"
              render={({ field: { onChange } }) => (
                <TextField
                  select
                  fullWidth
                  value={chartType.type2}
                  label={wordLibrary?.["chart type"] ?? "報表類型"}
                  onChange={onChange}
                >
                  {chartTypes.map((chartType) => (
                    <MenuItem key={chartType} value={chartType}>
                      {wordLibrary?.chartType ??
                        intlChartType?.[`${locale}`]?.[
                        `${chartType.toUpperCase()}`
                        ]}
                    </MenuItem>
                  ))}
                  <Button
                    variant="text"
                    fullWidth
                    sx={{
                      justifyContent: "start",
                    }}
                    onClick={() => {
                      setValue("chartType.type2", undefined);
                    }}
                  >
                    {wordLibrary?.clear ?? "清除"}
                  </Button>
                </TextField>
              )}
            />
          </Grid> */}
        </Grid>
      </Box>
    </FormSection>
  );
};

export default FormSectionChartType;
