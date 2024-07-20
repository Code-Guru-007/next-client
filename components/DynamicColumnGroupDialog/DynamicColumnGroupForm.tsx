import React, { FC, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FormProvider, Controller, useFormContext } from "react-hook-form";

import useOrgTagGroups from "utils/useOrgTagGroups";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";

import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import TextField from "@eGroupAI/material/TextField";
import Stepper from "@eGroupAI/material/Stepper";
import Step from "@eGroupAI/material/Step";
import StepButton from "@eGroupAI/material/StepButton";
import Box from "@eGroupAI/material/Box";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import Form from "components/Form";
import TagAutocomplete from "components/TagAutocomplete";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import { ServiceModuleValue } from "interfaces/utils";
import { DynamicColumnGroupFormInput } from "interfaces/form";
import useReduxSteps from "utils/useReduxSteps";
import { OrganizationColumn } from "interfaces/entities";
import { EachRowState } from "@eGroupAI/material-module/DataTable";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import DynamicColumnMiniTable from "./DynamicColumnMiniTable";

export const FORM = "DynamicColumnGroupForm";

interface Props {
  selectedColumnList?: OrganizationColumn[];
  isLoading?: boolean;
  serviceModuleValue: ServiceModuleValue;
  columnTable: string;
  tagStatus?: boolean;
  stepsContext: string[];
}

const DynamicColumnGroupForm: FC<Props> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);

  const {
    selectedColumnList,
    isLoading,
    serviceModuleValue,
    columnTable,
    tagStatus,
    stepsContext,
  } = props;

  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { data } = useOrgTagGroups(
    {
      organizationId,
    },
    {
      locale,
      serviceModuleValue,
    }
  );
  const tags = useOrgTagsByGroups(data?.source);
  const methods = useFormContext<DynamicColumnGroupFormInput>();
  const { control, setValue } = methods;

  const { setActiveStep, activeStep = 0 } = useReduxSteps(
    "DynamicColumnGroupSteps"
  );
  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };

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
            {stepsContext.map((label, index) => (
              <Step key={label}>
                <StepButton color="inherit" onClick={handleStep(index)}>
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
                <Typography
                  component="h5"
                  color="textSecondary"
                  sx={{ marginLeft: "15px" }}
                >
                  {wordLibrary?.["dynamic field group name"] ??
                    "動態欄位群組名稱"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="columnGroupName"
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      {...field}
                      placeholder={wordLibrary?.["group name"] ?? "群組名稱"}
                    />
                  )}
                />
              </Grid>
              {tagStatus && (
                <Grid item xs={12}>
                  <Typography
                    component="h5"
                    color="textSecondary"
                    sx={{ marginLeft: "15px" }}
                  >
                    {wordLibrary?.["add tag"] ?? "新增標籤"}
                  </Typography>
                </Grid>
              )}
              {tagStatus && (
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name="organizationTagList"
                    render={({ field }) => (
                      <TagAutocomplete
                        value={tags?.filter(
                          (tag) =>
                            field.value.findIndex(
                              (el) => el.tagId === tag.tagId
                            ) !== -1
                        )}
                        serviceModuleValue={serviceModuleValue}
                        onChange={(e, value) => {
                          const list = value.map((el) => ({
                            tagId: el.tagId,
                          }));
                          setValue("organizationTagList", list);
                        }}
                      />
                    )}
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default DynamicColumnGroupForm;
