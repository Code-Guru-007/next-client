import React from "react";
// import { SummaryMethodTypes } from "@eGroupAI/typings/apis";
import { Box, Grid } from "@mui/material";
import { useFormContext } from "react-hook-form";
// import { useSelector } from "react-redux";
// import { getWordLibrary } from "redux/wordLibrary/selectors";
import { OrgChartReportFormInput } from "interfaces/form";
// import Iconify from "minimal/components/iconify";

// import FormSectionSummaryMethod from "./FormSectionSummaryMethod";

export interface FormSectionSummaryMethodsProps {
  maxItems?: number;
}

const FormSectionSummaryMethods = function (
  props: FormSectionSummaryMethodsProps
) {
  const { maxItems } = props;

  // const wordLibrary = useSelector(getWordLibrary);
  // const addBtnRef = useRef<HTMLButtonElement>(null);

  const { watch } = useFormContext<OrgChartReportFormInput>();
  // const { remove } = useFieldArray({
  //   control,
  //   name: "summaryMethods",
  // });

  const summaryMethods = watch("summaryMethods");
  const addAble = maxItems ? summaryMethods.length < maxItems : true;

  return (
    <Box sx={{ marginTop: 4 }}>
      {/* <Typography
        variant="h6"
        sx={{
          lineHeight: "28px",
          paddingBottom: "16px",
          borderBottom: "1px solid #919EAB3d",
        }}
      >
        {wordLibrary?.["summary methods"] ?? "匯總方法"}
      </Typography> */}
      <Box
        sx={{
          paddingBottom: 3,
          borderBottom: "1px solid #919eab33",
        }}
      >
        <Grid container>
          {/* {summaryMethods.map((summaryMethod, index) => (
            <Grid item xs={12}>
              <FormSectionSummaryMethod
                key={`method-${index}-${summaryMethod?.value}`}
                index={index}
                onRemove={(index) => remove(index)}
              />
            </Grid>
          ))} */}
          {addAble && (
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              {/* <Button
                ref={addBtnRef}
                variant="text"
                color="primary"
                onClick={() => {
                  append({
                    value: SummaryMethodTypes.RECORDS,
                  });

                  //   setTimeout(() => {
                  //     addBtnRef?.current?.scrollIntoView({ behavior: "smooth" });
                  //   }, 50);
                }}
                sx={{ mt: 3 }}
              >
                {wordLibrary?.["New session"] ?? "+ New session1"}
              </Button> */}
            </Grid>
          )}
          {/* {summaryMethods.length > 1 && (
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-start" }}
            >
              <Button
                variant="text"
                color="error"
                startIcon={<Iconify icon="solar:trash-bin-minimalistic-bold" />}
                onClick={() => {
                  setValue("summaryMethods", [
                    { value: SummaryMethodTypes.RECORDS },
                  ]);
                }}
              >
                {wordLibrary?.["clear all"] ?? "Clear All"}
              </Button>
            </Grid>
          )} */}
        </Grid>
      </Box>
    </Box>
  );
};

export default FormSectionSummaryMethods;
