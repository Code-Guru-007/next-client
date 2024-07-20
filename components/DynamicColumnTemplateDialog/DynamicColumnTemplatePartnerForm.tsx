import React, { FC, useEffect, useMemo, useState } from "react";
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
import { EachRowState } from "@eGroupAI/material-module/DataTable";
import { DynamicColumnTemplatePartnerFormInput } from "interfaces/form";
import useReduxSteps from "utils/useReduxSteps";
import { OrganizationColumn } from "interfaces/entities";

import DynamicColumnMiniTable from "./DynamicColumnMiniTable";

export const FORM = "DynamicColumnTemplatePartnerForm";

interface Props {
  selectedColumnList?: OrganizationColumn[];
  isLoading?: boolean;
  serviceModuleValue: ServiceModuleValue;
  columnTable: string;
}

const steps = ["選擇欄位", "設定"];

const DynamicColumnTemplatePartnerForm: FC<Props> = function (props) {
  const { selectedColumnList, isLoading, columnTable } = props;

  const organizationId = useSelector(getSelectedOrgId);
  const methods = useFormContext<DynamicColumnTemplatePartnerFormInput>();
  const { control, setValue } = methods;

  const { setActiveStep, activeStep = 0 } = useReduxSteps(
    "DynamicColumnTemplateSteps"
  );

  const defaultCheckedRowIds = useMemo(
    () => selectedColumnList?.map((c) => c.columnId),
    [selectedColumnList]
  );
  const [tempRowState, setTempRowState] = useState<
    EachRowState<OrganizationColumn>
  >({});

  const [tempCheckedRowIds, setTempCheckedRowIds] = useState<
    string[] | undefined
  >(defaultCheckedRowIds);

  useEffect(() => {
    setTempCheckedRowIds(() =>
      Object.values(tempRowState)
        .filter((row) => row?.checked)
        .map((rowData) => rowData?.data?.columnId || "")
    );
  }, [tempRowState]);
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
        defaultCheckedRowIds={tempCheckedRowIds}
        onEachRowStateChange={(state) => {
          setTempRowState(state);
        }}
        columnTable={columnTable}
      />
    );

  return (
    <FormProvider {...methods}>
      <Form id={FORM}>
        <Box marginBottom={2}>
          <Stepper nonLinear activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepButton
                  color="inherit"
                  onClick={() => {
                    setActiveStep(index);
                  }}
                >
                  {label}
                </StepButton>
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

export default DynamicColumnTemplatePartnerForm;
