import React, { FC, useMemo, useEffect, useRef, useState } from "react";
import { makeStyles } from "@mui/styles";

import { format } from "@eGroupAI/utils/dateUtils";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Box from "@eGroupAI/material/Box";

import useOrgUserFinanceSummary from "utils/useOrgUserFinanceSummary";
import { useSelector } from "react-redux";
import { OrganizationUser } from "interfaces/entities";
import EditSectionHeader from "components/EditSectionHeader";

import {
  Chart,
  ChartData,
  ChartConfiguration,
  ChartTypeRegistry,
  CategoryScale,
  TimeScale,
  LinearScale,
  BarElement,
  LineElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { getWordLibrary } from "redux/wordLibrary/selectors";

Chart.register(
  BarController,
  LineController,
  CategoryScale,
  TimeScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

const useStyles = makeStyles({
  canvas: {
    maxHeight: "500px",
  },
});

const parseMonth = (m: number) => {
  if (m < 10) {
    return `0${m}`;
  }
  return m;
};

export type ChartDT = {
  date?: string;
  income: number;
  expenditure: number;
  cashflow: number;
};

type ChartTypes = keyof ChartTypeRegistry;

export interface UserFinanceProps {
  orgUser?: OrganizationUser;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const UserFinance: FC<UserFinanceProps> = function (props) {
  const { orgUser } = props;
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const { data: rowData } = useOrgUserFinanceSummary({
    organizationId,
    organizationUserId: orgUser?.organizationUserId,
  });

  const wordLibrary = useSelector(getWordLibrary);

  const graphData: ChartDT[] = useMemo(() => {
    const years = rowData
      ? Object.keys(rowData).map((year) => {
          const months = rowData[year];
          return months
            ? Object.values(months).map((el) => ({
                date: format(`${year}-${parseMonth(el.month)}-01`, "yyyy-MM"),
                income: el.income,
                expenditure: el.expenditure,
                cashflow: el.income - el.expenditure,
              }))
            : [];
        })
      : [];
    return years?.reduce((a, b) => [...a, ...b], []);
  }, [rowData]);
  const labels = graphData.map((el) => el.date);
  const incomeData = graphData.map((el) => el.income);
  const expenditureData = graphData.map((el) => el.expenditure);
  const cashflowData = graphData.map(
    (el) => Number(el?.income) - Number(el?.expenditure)
  );

  const data: ChartData<ChartTypes, number[]> = {
    labels,
    datasets: [
      {
        type: "line",
        label: `${wordLibrary?.["cash flow"] ?? "現金流"}`,
        backgroundColor: "rgb(52,152,219)",
        borderColor: "rgb(52,152,219)",
        fill: false,
        data: cashflowData,
      },
      {
        type: "bar",
        label: `${wordLibrary?.income ?? "收入"}`,
        backgroundColor: "rgb(46,204,113)",
        borderColor: "rgb(46,204,113)",
        data: incomeData,
      },
      {
        type: "bar",
        label: `${wordLibrary?.expenditure ?? "支出"}`,
        backgroundColor: "rgb(231,76,60)",
        borderColor: "rgb(231,76,60)",
        data: expenditureData,
      },
    ],
  };

  const config: ChartConfiguration<ChartTypes> = {
    type: "line",
    data,
    options: {
      responsive: true,
    },
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [chartObj, setChartObj] = useState<Chart | null>(null);

  useEffect(() => {
    if (chartObj) {
      chartObj.data = data;
      chartObj.update();
    } else {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        const ch = new Chart(ctx, config);
        setChartObj(ch);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData]);

  return (
    <>
      <EditSectionHeader primary={wordLibrary?.Finance ?? "財務紀錄"} />
      <Box>
        <canvas className={classes.canvas} ref={canvasRef} />
      </Box>
    </>
  );
};

export default UserFinance;
