import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Box, Button, Grid, MenuItem, TextField } from "@mui/material";
import Iconify from "minimal/components/iconify";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import { SummaryMethodTypes } from "@eGroupAI/typings/apis";
import { OrgChartReportFormInput } from "interfaces/form";

import { intlSummaryMethods } from "./types";

export interface FormSectionSummaryMethodProps {
  index: number;
  onRemove?: (index: number) => void;
  onChange?: (value: SummaryMethodTypes) => void;
}

const FormSectionSummaryMethod = (props: FormSectionSummaryMethodProps) => {
  const { index, onRemove } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const locale = useSelector(getGlobalLocale);

  const { control, watch, setValue } =
    useFormContext<OrgChartReportFormInput>();
  const summaryMethods = watch(`summaryMethods`);
  const summaryMethod = watch(`summaryMethods.${index}`);

  const summaryMethodTypes = Object.values(SummaryMethodTypes);

  return (
    <Box
      sx={{
        py: 3,
        borderBottom: "1px dashed #919eab33",
        mx: { sm: 1.5, xs: 0 },
      }}
    >
      <Grid item xs={12}>
        <Controller
          control={control}
          name={`summaryMethods.${index}`}
          render={({ field: { onChange } }) => (
            <TextField
              select
              fullWidth
              disabled
              value={summaryMethod.value}
              onChange={(e) => {
                onChange(e);
                setValue(
                  `summaryMethods.${index}.value`,
                  SummaryMethodTypes?.[`${e.target.value}`]
                );
              }}
            >
              {summaryMethodTypes.map((summaryMethod) => (
                <MenuItem key={summaryMethod} value={summaryMethod}>
                  {wordLibrary?.summaryMethod ??
                    intlSummaryMethods?.[`${locale}`]?.[`${summaryMethod}`]}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>

      {summaryMethods.length > 1 && (
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
        >
          <Button
            variant="outlined"
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

export default FormSectionSummaryMethod;
