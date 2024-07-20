// components
import { DataTableContext } from "@eGroupAI/material-module/DataTable";
import { Box, CircularProgress } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import Chart, { useChart } from "minimal/components/chart";
import { useResponsive } from "minimal/hooks/use-responsive";
import { useContext } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { CHART_IDS } from "../types";
// ----------------------------------------------------------------------

type Props = {
  series: {
    name: string;
    data: number[];
  }[];
  categories: any;
  setSelectedInfo?: React.Dispatch<
    React.SetStateAction<
      | {
          chartType: any;
          xAxisValue: any;
          yAxisValue: any;
          dataPointIndex: any;
          seriesIndex: any;
        }
      | undefined
    >
  >;
};

const useStyles = makeStyles(() => ({
  loader: {
    position: "absolute",
    top: 0,
    bottome: 0,
    left: 0,
    right: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    background: "rgba(255,255,255,0.5)",
    width: "100%",
    height: "100%",
  },
  showLoader: {
    display: "flex",
  },
}));

export default function ChartColumnMultiple({
  series = [],
  categories = [""],
  setSelectedInfo,
}: Props) {
  const classes = useStyles();

  const { isLoadingChartResult = false } = useContext(DataTableContext);

  const wordLibrary = useSelector(getWordLibrary);
  const isDownMd = useResponsive("down", "md");

  const chartOptions = useChart({
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}`,
      },
    },
    plotOptions: { bar: { columnWidth: "36%" } },

    // other options...
    noData: {
      text: wordLibrary?.["no data available"] ?? "無資料",
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        color: "#333",
        fontSize: "18px",
        fontFamily: "Helvetica, Arial, sans-serif",
      },
    },
    chart: {
      id: CHART_IDS.MULTI_BAR_CHART,
      toolbar: {
        show: false,
        offsetX: 0,
        offsetY: -24,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
        export: {
          csv: {
            filename: "export-csv",
            // columnDelimiter?: string,
            // headerCategory?: string,
            // headerValue?: string,
            // dateFormatter?(timestamp?: number): any,
          },
          svg: {},
          png: {},
        },
        autoSelected: "zoom",
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const { dataPointIndex, seriesIndex } = config;

          const chartType = chartContext.w.config.chart.type;

          let xAxisValue;
          let yAxisValue;
          if (chartType === "pie") {
            // For pie chart, x-axis value is the label
            xAxisValue = chartContext.w.globals.labels?.[dataPointIndex];
            yAxisValue = chartContext.w.globals.series?.[dataPointIndex]; // y-axis value is the series value
          } else {
            // For other chart types, x-axis value is the x value and y-axis value is the y value
            xAxisValue =
              chartContext.axes.w.config.xaxis.categories?.[dataPointIndex];
            yAxisValue =
              chartContext.w.globals.series?.[
                seriesIndex === -1 ? 0 : seriesIndex
              ]?.[dataPointIndex];
          }

          if (setSelectedInfo)
            setSelectedInfo({
              chartType,
              xAxisValue,
              yAxisValue,
              dataPointIndex,
              seriesIndex: seriesIndex === -1 ? 0 : seriesIndex,
            });
        },
      },
    },
  });

  return (
    <Box sx={{ maxWidth: "100%", position: "relative" }}>
      <Box
        className={clsx(
          classes.loader,
          isLoadingChartResult && classes.showLoader
        )}
      >
        <CircularProgress />
      </Box>
      <Chart
        dir="ltr"
        type="bar"
        series={series}
        options={chartOptions}
        height={400}
        width={isDownMd ? undefined : 800}
      />
    </Box>
  );
}
