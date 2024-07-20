import React, { FC, useMemo } from "react";
import { useSelector } from "react-redux";
import { FormProvider, Controller, useFormContext } from "react-hook-form";

import Grid from "@eGroupAI/material/Grid";
import TextField from "@eGroupAI/material/TextField";
import Stepper from "@eGroupAI/material/Stepper";
import Step from "@eGroupAI/material/Step";
import StepButton from "@eGroupAI/material/StepButton";
import Box from "@eGroupAI/material/Box";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import Form from "components/Form";

import { ServiceModuleValue } from "interfaces/utils";
import { DynamicColumnTemplateUserFormInput } from "interfaces/form";
import useReduxSteps from "utils/useReduxSteps";
import { OrganizationColumn } from "interfaces/entities";

import DynamicColumnMiniTable from "./DynamicColumnMiniTable";

export const FORM = "DynamicColumnTemplateUserForm";

interface Props {
  selectedColumnList?: OrganizationColumn[];
  isLoading?: boolean;
  serviceModuleValue: ServiceModuleValue;
  columnTable: string;
}

const steps = ["選擇欄位", "設定"];

const DynamicColumnTemplateUserForm: FC<Props> = function (props) {
  const { selectedColumnList, isLoading, columnTable } = props;

  const organizationId = useSelector(getSelectedOrgId);
  const methods = useFormContext<DynamicColumnTemplateUserFormInput>();
  const { control, setValue } = methods;

  const { activeStep } = useReduxSteps("DynamicColumnTemplateSteps");

  const defaultCheckedRowIds = useMemo(
    () => selectedColumnList?.map((c) => c.columnId),
    [selectedColumnList]
  );

  const renderMiniTable = () =>
    !isLoading && (
      <DynamicColumnMiniTable
        organizationId={organizationId}
        onChangeSelectedColumns={(columnIds) => {
          const list = columnIds.map((id) => ({
            columnId: id,
          }));
          setValue("organizationColumnList", list);
        }}
        defaultCheckedRowIds={defaultCheckedRowIds}
        columnTable={columnTable}
      />
    );

  return (
    <FormProvider {...methods}>
      <Form id={FORM}>
        <Box marginBottom={2}>
          <Stepper nonLinear activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepButton color="inherit">{label}</StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>
        <Grid container spacing={2}>
          {activeStep === 0 && (
            <Grid item xs={12}>
              {renderMiniTable()}
            </Grid>
          )}
          {activeStep === 1 && (
            <>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="organizationColumnTemplateTitle"
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      {...field}
                      placeholder="事件範本名稱"
                    />
                  )}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default DynamicColumnTemplateUserForm;
