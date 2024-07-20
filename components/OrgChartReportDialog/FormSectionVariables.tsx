import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { OrgChartReportFormInput, ReportVariable } from "interfaces/form";
import FormSectionVariable from "./FormSectionVariable";
import AliasEditDialog from "./AliasEditDialog";
import AliasVariableDialog from "./AliasVariableDialog";
import AliasOptionsDialog from "./AliasOptionsDialog";
import FormSection from "./FormSection";
import FormSectionTitle from "./FormSectionTitle";

export interface FormSectionVariablesProps {
  maxItems?: number;
}

const FormSectionVariables = function (props: FormSectionVariablesProps) {
  const { maxItems = 2 } = props;

  const wordLibrary = useSelector(getWordLibrary);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const { control } = useFormContext<OrgChartReportFormInput>();
  const {
    fields: reportVariables,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: "reportVariables",
  });

  const addAble =
    reportVariables.length < maxItems &&
    !reportVariables.some((v) => v.mode.toLowerCase() === "action");

  const [selectedVariable, setSelectedVariable] = useState<ReportVariable>();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    const actionIndex = reportVariables.findIndex(
      (f) => f.mode.toLowerCase() === "action"
    );
    if (actionIndex !== -1) {
      reportVariables.forEach((_, i) => {
        if (i !== actionIndex) remove(i);
      });
    }
  }, [reportVariables, remove]);

  return (
    <FormSection>
      <FormSectionTitle>
        {wordLibrary?.["grouped items"] ?? "選擇維度"}
      </FormSectionTitle>
      <Box>
        <Grid container spacing={3}>
          {reportVariables.map((reportVariable, index) => (
            <Grid item xs={12}>
              <FormSectionVariable
                key={`variable-${index}-${reportVariable?.value}`}
                index={index}
                onRemove={(index) => remove(index)}
                onChange={(value) => {
                  if (value) update(index, value);
                  else
                    update(index, {
                      columnType: "",
                      mode: "",
                      value: "",
                      name: "",
                    });
                }}
                setSelectedVariable={setSelectedVariable}
                setSelectedIndex={setSelectedIndex}
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
                    columnType: "",
                    mode: "",
                    value: "",
                    name: "",
                  });

                  // setTimeout(() => {
                  //   addBtnRef?.current?.scrollIntoView({ behavior: "smooth",  });
                  // }, 50);
                }}
                sx={{ mt: 3 }}
                id="report-form-variable-new-button"
                data-tid="report-form-variable-new-button"
              >
                {wordLibrary?.["New session"] ?? "+ 新增維度"}
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      {
        <>
          <AliasEditDialog
            selectedVariable={selectedVariable}
            selectedIndex={selectedIndex}
          />
          <AliasVariableDialog
            selectedVariable={selectedVariable}
            selectedIndex={selectedIndex}
          />
          <AliasOptionsDialog
            selectedVariable={selectedVariable}
            selectedIndex={selectedIndex}
          />
        </>
      }
    </FormSection>
  );
};

export default FormSectionVariables;
