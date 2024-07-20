import type { FilterDropDownProps } from "@eGroupAI/material-lab/FilterDropDown";
import type { TableFilterConditionGroup } from "@eGroupAI/material-module/DataTable";
import { ServiceModuleValue } from "interfaces/utils";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { FilterValues } from "utils/useDataTableFilterColumns";

export interface ReportDisplayContextValue {
  serviceModuleValue: ServiceModuleValue;
  filterConditionGroups?: TableFilterConditionGroup[];
  FilterDropDownProps?: Omit<FilterDropDownProps, "options" | "value">;
  onFilterValuesSubmit?: (
    values: FilterValues,
    index?: number | undefined
  ) => void;
  reportChartShow?: boolean;
  setReportChartShow?: (value: React.SetStateAction<boolean>) => void;
  reportMode: "table" | "chart";
  setReportMode: (mode: "table" | "chart") => void;
}

export const ReportDisplayContext = createContext<
  ReportDisplayContextValue | undefined
>(undefined);

export const ReportDisplayContextProvider = ({
  children,
  ...props
}: ReportDisplayContextValue & { children: ReactNode }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => props, Object.values(props));
  return (
    <ReportDisplayContext.Provider value={value}>
      {children}
    </ReportDisplayContext.Provider>
  );
};

export const useReportDisplayContext = () => {
  const value = useContext(ReportDisplayContext);
  if (!value)
    throw new Error(
      "`useReportDisplayContext` must be used within a `ReportDisplayContextProvider`"
    );
  return value;
};
