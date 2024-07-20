import { Box } from "@mui/material";
import ReportChart from "components/ReportChart";
import {
  ReportDisplayContextProvider,
  type ReportDisplayContextValue,
} from "components/ReportDisplay/ReportDisplayContext";
import { ReportTable } from "components/ReportTable";
import { ReportToolbar } from "components/ReportToolbar";
import { useState } from "react";

export type ReportDisplayProps = Pick<
  ReportDisplayContextValue,
  | "serviceModuleValue"
  | "filterConditionGroups"
  | "FilterDropDownProps"
  | "onFilterValuesSubmit"
  | "reportChartShow"
  | "setReportChartShow"
>;

export const ReportDisplay = (props: ReportDisplayProps) => {
  const [reportMode, setReportMode] = useState<"table" | "chart">("chart");

  return (
    <ReportDisplayContextProvider
      {...props}
      reportMode={reportMode}
      setReportMode={setReportMode}
    >
      <Box sx={{ width: "100%", position: "relative" }}>
        <ReportToolbar />
      </Box>
      {reportMode === "chart" && <ReportChart />}
      {reportMode === "table" && <ReportTable />}
    </ReportDisplayContextProvider>
  );
};
