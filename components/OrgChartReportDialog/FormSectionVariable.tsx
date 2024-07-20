import React, { useCallback, useContext, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Iconify from "minimal/components/iconify";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import {
  ChartRecentTimeGranularity,
  ChartTimeGranularity,
  ColumnType,
} from "@eGroupAI/typings/apis";
import { OrgChartReportFormInput, ReportVariable } from "interfaces/form";
import { OrgChartReportVariableData } from "interfaces/entities";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import NewDateRangePicker from "@eGroupAI/material-lab/NewDateRangePicker";
import OrgChartReportDialogContext from "./OrgChartReportDialogContext";
import {
  intlReportVariableDateTimeGranularityTypes,
  intlReportVariableRecentDateTimeGranularityTypes,
} from "./types";

import { DIALOG as ALIAS_EDIT_DIALOG } from "./AliasEditDialog";
import { DIALOG as ALIAS_VARIABLE_DIALOG } from "./AliasVariableDialog";
import { DIALOG as ALIAS_OPTIONS_DIALOG } from "./AliasOptionsDialog";

export interface FormSectionVariableProps {
  index: number;
  onRemove?: (index: number) => void;
  onEditAlias?: (index: number) => void;
  onChange?: (value: ReportVariable | null) => void;
  setSelectedVariable: React.Dispatch<
    React.SetStateAction<ReportVariable | undefined>
  >;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}

const FormSectionVariable = (props: FormSectionVariableProps) => {
  const { index, onRemove, onChange, setSelectedVariable, setSelectedIndex } =
    props;
  const wordLibrary = useSelector(getWordLibrary);
  const locale = useSelector(getGlobalLocale);

  let label = "";
  if (index === 0) label = wordLibrary?.["big project"] ?? "維度";
  if (index === 1) label = wordLibrary?.["medium project"] ?? "維度";

  const { control, watch } = useFormContext<OrgChartReportFormInput>();

  const reportVariables = watch(`reportVariables`);
  const selectedVariableValuesForOthers = reportVariables
    .map((v) => v.value || "")
    .filter((_, i) => index !== i);
  const reportVariable = watch(`reportVariables.${index}`);

  const { orgChartVariables, isValidateForm } = useContext(
    OrgChartReportDialogContext
  );
  const options = useMemo(
    () =>
      orgChartVariables?.reduce<OrgChartReportVariableData[]>((a, b) => {
        const list = b.reportVariableDataList.map((item) => ({
          ...item,
          modeName: b.reportVariableModeName,
        }));
        const filteredList = list.filter(
          (item) => !selectedVariableValuesForOthers.includes(item.value)
        );
        return [...a, ...filteredList];
      }, []) || [],
    [orgChartVariables, selectedVariableValuesForOthers]
  );

  const variableAlias = reportVariable.axisName;
  const editedOptions = reportVariable.valueMapping?.filter(
    ({ alias }) => alias
  );

  const { openDialog: openAliasEditDialog } = useReduxDialog(ALIAS_EDIT_DIALOG);
  const { openDialog: openAliasVariableDialog } = useReduxDialog(
    ALIAS_VARIABLE_DIALOG
  );
  const { openDialog: openAliasOptionsDialog } =
    useReduxDialog(ALIAS_OPTIONS_DIALOG);

  const renderVariableDateTimeGranularity = useCallback(() => {
    const { columnType, mode } = reportVariable || {};

    if (columnType === ColumnType.DATE || columnType === ColumnType.DATETIME) {
      return (
        <Controller
          control={control}
          name={`reportVariables.${index}.timeGranularity`}
          defaultValue={ChartTimeGranularity.YEARLY}
          render={({ field }) => (
            <FormControl sx={{ width: "100%", ml: 1 }}>
              <FormLabel>
                {wordLibrary?.timeGranularity ?? "時間粒度"}
              </FormLabel>
              <RadioGroup row {...field}>
                {Object.keys(ChartTimeGranularity).map((key) => (
                  <FormControlLabel
                    key={ChartTimeGranularity[key]}
                    control={<Radio />}
                    value={ChartTimeGranularity[key]}
                    label={
                      wordLibrary?.[
                        `time granularity ${ChartTimeGranularity[key]}`
                      ] ??
                      intlReportVariableDateTimeGranularityTypes?.[
                        `${locale}`
                      ]?.[`${key}`]
                    }
                    sx={{ mr: 5 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        />
      );
    }
    if (mode.toLowerCase() === "action") {
      return (
        <Controller
          control={control}
          name={`reportVariables.${index}.recentTimeGranularity`}
          defaultValue={ChartRecentTimeGranularity.ALL_TIME}
          render={({ field }) => (
            <Stack spacing={1} ml={1}>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel>
                  {wordLibrary?.recentTimeGranularity ?? "時間粒度"}
                </FormLabel>
                <RadioGroup row {...field}>
                  {Object.keys(ChartRecentTimeGranularity).map((key) => (
                    <FormControlLabel
                      key={ChartRecentTimeGranularity[key]}
                      control={<Radio />}
                      value={ChartRecentTimeGranularity[key]}
                      label={
                        wordLibrary?.[
                          `time granularity ${ChartRecentTimeGranularity[key]}`
                        ] ??
                        intlReportVariableRecentDateTimeGranularityTypes?.[
                          `${locale}`
                        ]?.[`${key}`]
                      }
                      sx={{ mr: 5 }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              {field.value === "SPECIFIC_DATE" && (
                <>
                  <FormLabel sx={{ mb: 1 }}>
                    {wordLibrary?.["specific date range"] ?? "自訂日期區間"}
                  </FormLabel>
                  <Controller
                    control={control}
                    name={`reportVariables.${index}`}
                    render={({ field: { onChange, value } }) => (
                      <NewDateRangePicker
                        required
                        startDate={value.startDate}
                        endDate={value.endDate}
                        onChange={(dates) => {
                          onChange({
                            ...value,
                            startDate: dates[0]?.toISOString(),
                            endDate: dates[1]?.toISOString(),
                          });
                        }}
                      />
                    )}
                  />
                </>
              )}
            </Stack>
          )}
        />
      );
    }
    return null;
  }, [control, index, locale, reportVariable, wordLibrary]);

  return (
    <Box>
      <Grid item xs={12}>
        <Controller
          control={control}
          name={`reportVariables.${index}`}
          render={({ field: { value } }) => (
            <Autocomplete
              size="medium"
              id="report-form-select-dimention"
              data-tid="report-form-select-dimention"
              options={options}
              defaultValue={options.find(
                (item) => item?.value === reportVariable?.value
              )}
              value={options.find(
                (option) => option?.value === reportVariable?.value
              )}
              getOptionDisabled={(option) =>
                reportVariables.some((v) => !!v.value) &&
                !value.value &&
                option.mode.toLowerCase() === "action"
              }
              renderInput={({ InputProps, ...others }) => (
                <TextField
                  required
                  error={isValidateForm && !reportVariable?.value}
                  variant="outlined"
                  placeholder={label}
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
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) =>
                option?.value === value?.value
              }
              groupBy={(option) => option.modeName || ""}
              filterOptions={(options, state) => {
                if (state.inputValue)
                  return options.filter((o) =>
                    o.name?.includes(state.inputValue)
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
        {renderVariableDateTimeGranularity()}
      </Grid>
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 3,
        }}
      >
        <Stack direction="row" spacing={0.5}>
          {variableAlias && (
            <>
              <Typography
                variant="body2"
                color={"text.secondary"}
                fontSize={{ sm: 14, xs: 11 }}
              >
                {wordLibrary?.["alias edited"] ?? "已編輯"}
              </Typography>
              <Typography
                component={"a"}
                variant="body2"
                color="primary"
                fontSize={{ sm: 14, xs: 11 }}
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  if (reportVariable?.value) {
                    setSelectedIndex(index);
                    setSelectedVariable(reportVariable);
                  }
                  openAliasVariableDialog();
                }}
              >
                {wordLibrary?.["variable alias"] ?? "維度別名"}
              </Typography>
            </>
          )}
          {variableAlias && editedOptions?.length !== 0 && (
            <Typography
              variant="body2"
              color={"text.secondary"}
              fontSize={{ sm: 14, xs: 11 }}
            >
              {", "}
            </Typography>
          )}
          {editedOptions && editedOptions?.length !== 0 && (
            <>
              <Typography
                variant="body2"
                color={"text.secondary"}
                fontSize={{ sm: 14, xs: 11 }}
              >
                {wordLibrary?.count ?? `${editedOptions?.length}個`}
              </Typography>
              <Typography
                component={"a"}
                variant="body2"
                color="primary"
                fontSize={{ sm: 14, xs: 11 }}
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  if (reportVariable?.value) {
                    setSelectedIndex(index);
                    setSelectedVariable(reportVariable);
                  }
                  openAliasOptionsDialog();
                }}
              >
                {wordLibrary?.["option alias"] ?? "選項別名"}
              </Typography>
            </>
          )}
        </Stack>
        <Button
          variant="text"
          size="small"
          disabled={!reportVariable?.value}
          onClick={() => {
            if (reportVariable?.value) {
              setSelectedIndex(index);
              setSelectedVariable(reportVariable);
            }
            openAliasEditDialog();
          }}
        >
          {wordLibrary?.["edit alias"] ?? "編輯別名"}
        </Button>
      </Grid>

      {reportVariables.length > 1 && (
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}
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
            {wordLibrary?.remove ?? "刪除"}
          </Button>
        </Grid>
      )}
    </Box>
  );
};

export default FormSectionVariable;
