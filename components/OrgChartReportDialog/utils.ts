import {
  Option,
  Value,
  ValueType,
} from "@eGroupAI/material-lab/FilterDropDown";
import {
  ChartRecentTimeGranularity,
  ChartTimeGranularity,
} from "@eGroupAI/typings/apis";
// import { FilterSearch } from "@eGroupAI/typings/apis";
import { ReportVariable } from "interfaces/form";
import { ChartReportDataSource } from "interfaces/payloads";
import { ServiceModuleValue } from "interfaces/utils";
import {
  FilterValues,
  //   parseFilterValuesToEqualAndRange,
} from "utils/useDataTableFilterColumns";

export function getReportResultApiPayloadDataSourceList({
  serviceModuleValue,
  reportVariables,
}: {
  serviceModuleValue: ServiceModuleValue;
  reportVariables: ReportVariable[];
}): ChartReportDataSource[] {
  return reportVariables
    .filter((v) => v.value)
    .map((v) => ({
      mode: v.mode,
      value: v.value || "",
      serviceModuleValue,
      axisName: v.axisName,
      valueMapping: v.valueMapping?.reduce((a, b) => {
        if (b.alias) return { ...a, [b.label]: b.alias };
        return { ...a };
      }, {}),
      timeGranularity: v.columnType?.includes("DATE")
        ? v.timeGranularity || ChartTimeGranularity.YEARLY
        : undefined,
      recentTimeGranularity:
        v.recentTimeGranularity &&
        ![
          ChartRecentTimeGranularity.ALL_TIME,
          ChartRecentTimeGranularity.SPECIFIC_DATE,
        ].includes(v.recentTimeGranularity)
          ? v.recentTimeGranularity
          : undefined,
      startDate: v.startDate,
      endDate: v.endDate,
    }));
}

export function getFilterValuesFromFilterConditionForms({
  defaultFilterValues,
  filterConditions,
}: {
  defaultFilterValues: FilterValues;
  filterConditions: Option[];
}): FilterValues {
  return Object.keys(defaultFilterValues)
    .map((key) =>
      filterConditions
        .filter((c) => c.filterGroupIndex === Number(key) && !!c.filterValue)
        .reduce<Value>(
          (ca, cb) => ({ ...ca, [cb.filterId]: cb.filterValue as ValueType }),
          {}
        )
    )
    .reduce<FilterValues>((fa, fb, index) => ({ ...fa, [index]: fb }), {});
}
