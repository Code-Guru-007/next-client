import { useContext, useEffect } from "react";
import { DefaultValues, FormProvider, useForm } from "react-hook-form";
import Form from "components/Form";
import { OrgChartReportFormInput } from "interfaces/form";
import {
  ChartTypes,
  FilterConditionsTypes,
  SummaryMethodTypes,
} from "@eGroupAI/typings/apis";
import { ServiceModuleValue } from "interfaces/utils";

import { FilterValues } from "utils/useDataTableFilterColumns";
import { FilterDropDownProps } from "@eGroupAI/material-lab/FilterDropDown";
import FormSectionChartType from "./FormSectionChartType";
import FormSectionVariables from "./FormSectionVariables";
import FormSectionFilters from "./FormSectionFilters";

import OrgReportSaveDialog from "./OrgReportSaveDialog";
import OrgChartReportDialogContext from "./OrgChartReportDialogContext";

export interface OrgChartReportFormProps {
  serviceModuleValue?: ServiceModuleValue;
  onSubmit?: (values: OrgChartReportFormInput) => void;
  defaultValues?: DefaultValues<OrgChartReportFormInput>;
  onFilterValuesSubmit?: (values: FilterValues) => void;
  onSubmitFilterValue?: FilterDropDownProps["onSubmit"];
  isEditing?: boolean;
}

export const FORM = "OrgChartReportForm";

const DEFAULT_VALUES: OrgChartReportFormProps["defaultValues"] = {
  reportChartType: {
    type1: ChartTypes.PIE,
    // type2: ChartTypes.STACK,
  },
  reportVariables: [{ columnType: "", mode: "", value: "", name: "" }],
  summaryMethods: [{ value: SummaryMethodTypes.RECORDS }],
  filterConditions: [
    {
      filterId: "",
      filterGroupName: "",
      filterKey: "",
      columnId: "",
      filterName: "",
    },
  ],
  filterConditionsType: FilterConditionsTypes.OR,
  hasFixedResult: false,
  organizationReportName: "",
};

const OrgChartReportForm = (props: OrgChartReportFormProps) => {
  const {
    onSubmit,
    serviceModuleValue,
    defaultValues,
    onSubmitFilterValue,
    onFilterValuesSubmit,
    isEditing,
  } = props;

  const { setIsAbleToSave } = useContext(OrgChartReportDialogContext);

  const method = useForm<OrgChartReportFormInput>({
    defaultValues: defaultValues
      ? {
          reportChartType: {
            ...DEFAULT_VALUES.reportChartType,
            ...defaultValues?.reportChartType,
          },
          reportVariables:
            defaultValues?.reportVariables?.length !== 0
              ? defaultValues?.reportVariables
              : DEFAULT_VALUES.reportVariables,
          summaryMethods:
            defaultValues?.summaryMethods?.length !== 0
              ? defaultValues?.summaryMethods
              : DEFAULT_VALUES.summaryMethods,
          filterConditions:
            defaultValues?.filterConditions?.length !== 0
              ? defaultValues?.filterConditions
              : DEFAULT_VALUES.filterConditions,
          filterConditionsType:
            defaultValues?.filterConditionsType ??
            DEFAULT_VALUES.filterConditionsType,
          hasFixedResult:
            defaultValues.hasFixedResult ?? DEFAULT_VALUES.hasFixedResult,
          organizationReportName:
            defaultValues.organizationReportName ??
            DEFAULT_VALUES.organizationReportName,
        }
      : DEFAULT_VALUES,
  });

  const { handleSubmit, watch } = method;
  const selectedVariables = watch("reportVariables");

  useEffect(() => {
    if (setIsAbleToSave)
      setIsAbleToSave(selectedVariables.filter((v) => !v.value).length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedVariables.length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    selectedVariables?.[0]?.value,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    selectedVariables?.[1]?.value,
    setIsAbleToSave,
  ]);

  return (
    <FormProvider {...method}>
      <Form
        id={FORM}
        onSubmit={handleSubmit((values) => {
          if (onSubmit) {
            onSubmit(values);
          }
        })}
      >
        <FormSectionChartType />
        <FormSectionVariables maxItems={2} />
        <FormSectionFilters />

        <OrgReportSaveDialog
          serviceModuleValue={serviceModuleValue}
          onFilterValuesSubmit={onFilterValuesSubmit}
          onSubmitFilterValue={onSubmitFilterValue}
          isEditing={isEditing}
        />
      </Form>
    </FormProvider>
  );
};

export default OrgChartReportForm;
