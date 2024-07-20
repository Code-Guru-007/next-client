import { FilterDropDownProps } from "@eGroupAI/material-lab/FilterDropDown";
import {
  DataTableContext,
  TableFilterConditionGroup,
} from "@eGroupAI/material-module/DataTable";
import { ChartTimeGranularity, ChartTypes } from "@eGroupAI/typings/apis";
import { Box } from "@mui/material";
import { useReportDisplayContext } from "components/ReportDisplay/ReportDisplayContext";
import {
  ChartReportResult,
  type OrganizationReportDetail,
} from "interfaces/entities";
import { ReportValueMapping } from "interfaces/form";
import { ServiceModuleValue } from "interfaces/utils";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { FilterValues } from "utils/useDataTableFilterColumns";

import ChartBar from "./chart-view/chart-bar";
import ChartColumnMultiple from "./chart-view/chart-column-multiple";
import ChartLine from "./chart-view/chart-line";
import ChartPie from "./chart-view/chart-pie";

export interface ReportChartProps {
  serviceModuleValue: ServiceModuleValue;
  filterConditionGroups?: TableFilterConditionGroup[];
  FilterDropDownProps?: Omit<FilterDropDownProps, "options" | "value">;
  onFilterValuesSubmit?: (
    values: FilterValues,
    index?: number | undefined
  ) => void;
  reportChartShow?: boolean;
  setReportChartShow?: (value: React.SetStateAction<boolean>) => void;

  selectedTab?: string;
  type?:
    | "area"
    | "line"
    | "bar"
    | "histogram"
    | "pie"
    | "donut"
    | "radialBar"
    | "scatter"
    | "bubble"
    | "heatmap"
    | "treemap"
    | "boxPlot"
    | "candlestick"
    | "radar"
    | "polarArea"
    | "rangeBar";
  series?: any[];
  options?: any;
  width?: number;
  height?: number;
}

declare global {
  interface Window {
    Apex: any;
  }
}

function ReportChart() {
  const dataTableContext = useContext(DataTableContext);
  const selectedReport =
    dataTableContext?.selectedReport as OrganizationReportDetail;
  const {
    filterConditionGroups,
    FilterDropDownProps: { onSubmit: onSubmitFilterValue } = {},
    onFilterValuesSubmit,
    reportChartShow,
    setReportChartShow,
  } = useReportDisplayContext();

  const reportResult: ChartReportResult & {
    reportChartType: ChartTypes;
    timeGranularity?: ChartTimeGranularity;
    axisName?: { [key: string]: string };
    valueMapping?: { [key: string]: ReportValueMapping[] };
  } = {
    ...selectedReport?.reportResult,
    reportChartType: selectedReport?.reportChartType as ChartTypes,
  };

  const [dataManipulationStage, setDataManipulationStage] = useState<
    "INITIALIZED" | "CONFIGURED" | "READY"
  >("INITIALIZED");

  useEffect(() => {
    if (selectedReport) {
      setDataManipulationStage("INITIALIZED");
    }
  }, [selectedReport]);

  const [autoDetectedChartType, setAutoDetectedChartType] =
    useState<ChartTypes>();
  const [, setIsTimeGranularity] = useState<boolean>(false);
  const [, setTimeGranularity] = useState<ChartTimeGranularity>();

  const [xKey, setXKey] = useState<string>("");
  const [yKey, setYKey] = useState<string>("");
  const [valueKey, setValueKey] = useState<string>("");
  const [variableCount, setVariableCount] = useState<number>(1);

  useEffect(() => {
    if (
      dataManipulationStage === "INITIALIZED" &&
      reportResult?.reportColumnList
    ) {
      const keys = Object.keys(reportResult?.reportColumnList || {});
      if (keys.length === 3) {
        setVariableCount(2);
        setValueKey("3");
        if (
          reportResult?.reportColumnList?.[1]?.reportColumnType.includes(
            "DATE"
          ) ||
          reportResult?.reportColumnList?.[2]?.reportColumnType.includes("DATE")
        ) {
          setAutoDetectedChartType(ChartTypes.LINE);
          setIsTimeGranularity(true);
          setTimeGranularity(
            reportResult?.timeGranularity || ChartTimeGranularity.YEARLY
          );

          if (
            reportResult?.reportColumnList?.[1]?.reportColumnType.includes(
              "DATE"
            )
          ) {
            setXKey("1");
            setYKey("2");
          } else {
            setXKey("2");
            setYKey("1");
          }
        } else {
          setAutoDetectedChartType(ChartTypes.BAR);
          setIsTimeGranularity(false);
          setTimeGranularity(undefined);

          setXKey("1");
          setYKey("2");
        }
      } else if (keys.length === 2) {
        setVariableCount(1);
        setValueKey("2");
        setXKey("1");
        setYKey("");
        if (
          reportResult?.reportColumnList?.[1]?.reportColumnType.includes("DATE")
        ) {
          setAutoDetectedChartType(ChartTypes.LINE);
          setIsTimeGranularity(false);
          setTimeGranularity(undefined);
        } else {
          setAutoDetectedChartType(ChartTypes.PIE);
          setIsTimeGranularity(false);
          setTimeGranularity(undefined);
        }
      }
      setDataManipulationStage("CONFIGURED");
    }
  }, [
    reportResult?.reportColumnList,
    reportResult?.timeGranularity,
    dataManipulationStage,
  ]);

  const [pieChartSeries, setPieChartSeries] = useState<any>();
  const [pieChartLabels, setPieChartLabels] = useState<any>();

  const [barChartSeries, setBarChartSeries] = useState<any>();
  const [barChartCategories, setBarChartCategories] = useState<any>();

  const [lineChartSeries, setLineChartSeries] = useState<any>();
  const [lineChartCategories, setLineChartCategories] = useState<any>();

  const [xaxisValues, setXaxisValues] = useState<
    (string | number | undefined)[]
  >([]);
  const [yaxisValues, setYaxisValues] = useState<
    (string | number | undefined)[]
  >([]);

  useEffect(() => {
    if (
      dataManipulationStage === "CONFIGURED" &&
      reportResult?.reportDataList
    ) {
      const chartType = (
        reportResult?.reportChartType ||
        autoDetectedChartType ||
        ""
      ).toLowerCase();

      switch (true) {
        case chartType.includes("pie"): {
          setPieChartSeries(
            reportResult.reportDataList.map((d) => d?.[valueKey] || 0)
          );
          setPieChartLabels(
            reportResult.reportDataList.map((d) => (d?.[xKey] as string) || "")
          );
          break;
        }

        case chartType.includes("bar"): {
          if (variableCount === 1) {
            setBarChartSeries(
              reportResult.reportDataList.map((d) => d?.[valueKey] || 0)
            );
            setBarChartCategories(
              reportResult.reportDataList.map(
                (d) => (d?.[xKey] as string) || ""
              )
            );
          }
          if (variableCount === 2) {
            const xValues = [
              ...new Set(reportResult.reportDataList.map((item) => item[xKey])),
            ];
            setXaxisValues(xValues);

            const yValues = [
              ...new Set(reportResult.reportDataList.map((item) => item[yKey])),
            ];
            setYaxisValues(yValues);

            setBarChartSeries(
              yValues.map((yValue) =>
                reportResult.reportDataList
                  .filter((item) => item[yKey] === yValue)
                  .map((d) => d?.[valueKey] || 0)
              )
            );
            setBarChartCategories(xValues);
          }
          break;
        }

        case chartType.includes("line"): {
          if (variableCount === 1) {
            setLineChartSeries(
              reportResult.reportDataList.map((d) => d?.[valueKey] || 0)
            );
            setLineChartCategories(
              reportResult.reportDataList.map(
                (d) => (d?.[xKey] as string) || ""
              )
            );
          }
          if (variableCount === 2) {
            const xValues = [
              ...new Set(reportResult.reportDataList.map((item) => item[xKey])),
            ];
            setXaxisValues(xValues);

            const yValues = [
              ...new Set(reportResult.reportDataList.map((item) => item[yKey])),
            ];
            setYaxisValues(yValues);

            setLineChartSeries(
              yValues.map((yValue) =>
                reportResult.reportDataList
                  .filter((item) => item[yKey] === yValue)
                  .map((d) => d?.[valueKey] || 0)
              )
            );
            setLineChartCategories(xValues);
          }
          break;
        }

        default:
          break;
      }

      setDataManipulationStage("READY");
    }
  }, [
    autoDetectedChartType,
    reportResult?.reportDataList,
    reportResult?.reportChartType,
    valueKey,
    xKey,
    yKey,
    variableCount,
    dataManipulationStage,
  ]);

  const [selectedChartSegmentInfo, setSelectedChartSegmentInfo] = useState<{
    chartType: any;
    xAxisValue: any;
    yAxisValue: any;
    dataPointIndex: any;
    seriesIndex: any;
  }>();

  const defaultFilterValuesGrouped = useMemo(
    () =>
      filterConditionGroups
        ?.map((c, i) => ({ [i]: {} }))
        .reduce((a, b) => ({ ...a, ...b }), {}) as FilterValues,
    [filterConditionGroups]
  );

  // click handler of chart segment
  useEffect(() => {
    const { chartType, xAxisValue, yAxisValue, seriesIndex, dataPointIndex } =
      selectedChartSegmentInfo || {};
    if (reportChartShow && chartType && (yAxisValue || xAxisValue)) {
      // const axisName = reportResult?.axisName;
      const valueMapping = reportResult?.valueMapping;
      const xAxisAliasedLabelValue = valueMapping?.[xKey]?.find(
        (item) => item.alias === xAxisValue
      )?.label;

      switch (chartType) {
        case "pie": {
          const reportColumn = reportResult?.reportColumnList?.[xKey];

          const filterId = `${reportColumn?.filterKey}-${reportColumn?.columnId}-${reportColumn?.reportColumnName}`;

          const foundFilterConditionGroupIndex =
            filterConditionGroups?.findIndex((g) =>
              g.filterConditionList.map((c) => c.filterId).includes(filterId)
            );

          const foundFilterCondition = filterConditionGroups?.[
            (foundFilterConditionGroupIndex as number) || 0
          ]?.filterConditionList.find((c) => c.filterId === filterId);

          const foundFilterConditionDataListValue =
            foundFilterCondition?.dataList?.find(
              ({ name }) =>
                name === (xAxisAliasedLabelValue || (xAxisValue as string))
            )?.value;

          const filterValuesGrouped = {
            ...defaultFilterValuesGrouped,
            [foundFilterConditionGroupIndex as number]: {
              [filterId]: [`${foundFilterConditionDataListValue}`],
            },
          };

          const fValues = {
            [filterId]: [`${foundFilterConditionDataListValue}`],
          };

          if (onFilterValuesSubmit) onFilterValuesSubmit(filterValuesGrouped);
          if (onSubmitFilterValue) onSubmitFilterValue(fValues);
          if (setReportChartShow) setReportChartShow(false);
          break;
        }

        case "bar": {
          if (variableCount === 1) {
            const targetId =
              reportResult.reportDataList[dataPointIndex]?.targetId;
            if (targetId) {
              window.open(`/me/articles/${targetId}`, "_blank");
              break;
            }

            const reportColumn = reportResult?.reportColumnList?.[xKey];

            const filterId = `${reportColumn?.filterKey}-${reportColumn?.columnId}-${reportColumn?.reportColumnName}`;

            const foundFilterConditionGroupIndex =
              filterConditionGroups?.findIndex((g) =>
                g.filterConditionList.map((c) => c.filterId).includes(filterId)
              );

            const foundFilterCondition = filterConditionGroups?.[
              (foundFilterConditionGroupIndex as number) || 0
            ]?.filterConditionList.find((c) => c.filterId === filterId);

            const foundFilterConditionDataListValue =
              foundFilterCondition?.dataList?.find(
                ({ name }) =>
                  name === (xAxisAliasedLabelValue || (xAxisValue as string))
              )?.value;

            const filterValuesGrouped = {
              ...defaultFilterValuesGrouped,
              [foundFilterConditionGroupIndex as number]: {
                [filterId]: [`${foundFilterConditionDataListValue}`],
              },
            };

            const fValues = {
              [filterId]: [`${foundFilterConditionDataListValue}`],
            };

            if (onFilterValuesSubmit) onFilterValuesSubmit(filterValuesGrouped);
            if (onSubmitFilterValue) onSubmitFilterValue(fValues);
            if (setReportChartShow) setReportChartShow(false);
            break;
          } else if (variableCount === 2) {
            // xKey column ...
            const reportColumn = reportResult?.reportColumnList?.[xKey];

            const filterId = `${reportColumn?.filterKey}-${reportColumn?.columnId}-${reportColumn?.reportColumnName}`;

            const foundFilterConditionGroupIndex =
              filterConditionGroups?.findIndex((g) =>
                g.filterConditionList.map((c) => c.filterId).includes(filterId)
              );

            const foundFilterCondition = filterConditionGroups?.[
              (foundFilterConditionGroupIndex as number) || 0
            ]?.filterConditionList.find((c) => c.filterId === filterId);

            const foundFilterConditionDataListValue =
              foundFilterCondition?.dataList?.find(
                ({ name, value }) =>
                  name === (xAxisAliasedLabelValue || (xAxisValue as string)) ||
                  value === (xAxisAliasedLabelValue || (xAxisValue as string))
              )?.value;

            const fValues = {
              [filterId]: [`${foundFilterConditionDataListValue}`],
            };

            // yKey column ...
            const reportColumnY = reportResult?.reportColumnList?.[yKey];

            const filterIdY = `${reportColumnY?.filterKey}-${reportColumnY?.columnId}-${reportColumnY?.reportColumnName}`;

            const foundFilterConditionGroupIndexY =
              filterConditionGroups?.findIndex((g) =>
                g.filterConditionList.map((c) => c.filterId).includes(filterIdY)
              );

            const foundFilterConditionY = filterConditionGroups?.[
              (foundFilterConditionGroupIndexY as number) || 0
            ]?.filterConditionList.find((c) => c.filterId === filterIdY);

            const selectedSeriesName =
              (yaxisValues?.[seriesIndex] as string) || "";

            const foundFilterConditionDataListValueY =
              foundFilterConditionY?.dataList?.find(
                ({ name, value }) =>
                  name === selectedSeriesName || value === selectedSeriesName
              )?.value;

            const fValuesY = {
              [filterIdY]: [`${foundFilterConditionDataListValueY}`],
            };

            const mergedFilterValuesGrouped =
              foundFilterConditionGroupIndex === foundFilterConditionGroupIndexY
                ? {
                    ...defaultFilterValuesGrouped,
                    [foundFilterConditionGroupIndex as number]: {
                      [filterId]: [`${foundFilterConditionDataListValue}`],
                      [filterIdY]: [`${foundFilterConditionDataListValueY}`],
                    },
                  }
                : {
                    ...defaultFilterValuesGrouped,
                    [foundFilterConditionGroupIndex as number]: {
                      [filterId]: [`${foundFilterConditionDataListValue}`],
                    },
                    [foundFilterConditionGroupIndexY as number]: {
                      [filterIdY]: [`${foundFilterConditionDataListValueY}`],
                    },
                  };

            if (onFilterValuesSubmit)
              onFilterValuesSubmit(mergedFilterValuesGrouped);
            if (onSubmitFilterValue)
              onSubmitFilterValue({ ...fValues, ...fValuesY });
            if (setReportChartShow) setReportChartShow(false);
            break;
          }
          break;
        }
        default:
          break;
      }
      setSelectedChartSegmentInfo(undefined);
    }
  }, [
    defaultFilterValuesGrouped,
    filterConditionGroups,
    onFilterValuesSubmit,
    onSubmitFilterValue,
    pieChartSeries,
    reportResult?.reportColumnList,
    selectedChartSegmentInfo,
    setReportChartShow,
    valueKey,
    xKey,
    yKey,
    variableCount,
    barChartCategories,
    barChartSeries,
    xaxisValues,
    yaxisValues,
    reportChartShow,
    reportResult?.valueMapping,
    reportResult.reportDataList,
  ]);

  return (
    <Box sx={{ maxWidth: "100%", position: "relative" }}>
      {(reportResult?.reportChartType || autoDetectedChartType)
        ?.toLocaleLowerCase()
        .includes("pie") &&
        dataManipulationStage === "READY" && (
          <ChartPie
            series={pieChartSeries}
            labels={pieChartLabels}
            setSelectedInfo={setSelectedChartSegmentInfo}
          />
        )}
      {(reportResult?.reportChartType || autoDetectedChartType)
        ?.toLocaleLowerCase()
        .includes("bar") &&
        variableCount === 1 &&
        dataManipulationStage === "READY" && (
          <ChartBar
            series={barChartSeries}
            categories={barChartCategories}
            horizontal={false}
            setSelectedInfo={setSelectedChartSegmentInfo}
          />
        )}
      {(reportResult?.reportChartType || autoDetectedChartType)
        ?.toLocaleLowerCase()
        .includes("bar") &&
        variableCount === 2 &&
        dataManipulationStage === "READY" && (
          <ChartColumnMultiple
            series={yaxisValues.map((yValue, index) => ({
              name: (yValue as string) || "",
              data: barChartSeries?.[index] || [],
            }))}
            categories={xaxisValues}
            setSelectedInfo={setSelectedChartSegmentInfo}
          />
        )}
      {(reportResult?.reportChartType || autoDetectedChartType)
        ?.toLocaleLowerCase()
        .includes("line") &&
        dataManipulationStage === "READY" && (
          <ChartLine
            series={
              variableCount === 2
                ? yaxisValues.map((yValue, index) => ({
                    name: (yValue as string) || "",
                    data: lineChartSeries?.[index] || [],
                  }))
                : [{ name: "Users", data: lineChartSeries }]
            }
            categories={lineChartCategories}
            setSelectedInfo={setSelectedChartSegmentInfo}
          />
        )}
    </Box>
  );
}

export default ReportChart;
