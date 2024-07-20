import React, { useMemo } from "react";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material";

import { useTheme } from "@mui/styles";
import { WidgetTemplate } from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Iconify from "minimal/components/iconify";
import { AxiosError } from "axios";

import WidgetSummary from "./WidgetSummary";

export interface WidgetSummaryAnalyticsProps {
  widgetTemplateList: WidgetTemplate[];
  serviceModuleValue?: ServiceModuleValue;
  isLoading?: boolean;
  error?: AxiosError<unknown, any>;
  disableReFetchLoadingStatus?: boolean;
  interval?: number;
}

function WidgetSummaryAnalytics(props: WidgetSummaryAnalyticsProps) {
  const wordLibrary = useSelector(getWordLibrary);
  const theme = useTheme();
  const {
    widgetTemplateList,
    isLoading = false,
    error,
    disableReFetchLoadingStatus = true,
    interval,
  } = props;

  const totalEventWidget = useMemo(
    () => widgetTemplateList.filter((el) => el.widgetTemplateSort === 1)[0],
    [widgetTemplateList]
  );
  const ongoingEventWidget = useMemo(
    () => widgetTemplateList.filter((el) => el.widgetTemplateSort === 2)[0],
    [widgetTemplateList]
  );
  const reviewingEventWidget = useMemo(
    () => widgetTemplateList.filter((el) => el.widgetTemplateSort === 3)[0],
    [widgetTemplateList]
  );
  const expiredEventWidget = useMemo(
    () => widgetTemplateList.filter((el) => el.widgetTemplateSort === 4)[0],
    [widgetTemplateList]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <WidgetSummary
          widgetTemplate={totalEventWidget}
          defaultTitle={
            wordLibrary?.["widget-template-total events"] ?? "所有事件數"
          }
          placeholder={
            <Iconify icon="eos-icons:three-dots-loading" width={30} />
          }
          defaultIcon={
            <Iconify
              icon="ic:twotone-calendar-month"
              width={50}
              color={alpha(theme.palette.primary.main, 0.8)}
            />
          }
          isLoading={isLoading}
          error={error}
          disableReFetchLoadingStatus={disableReFetchLoadingStatus}
          intervalToReFetch={interval}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <WidgetSummary
          widgetTemplate={ongoingEventWidget}
          defaultTitle={
            wordLibrary?.["widget-template-ongoing events"] ?? "進行中事件數"
          }
          placeholder={
            <Iconify icon="eos-icons:three-dots-loading" width={30} />
          }
          defaultColor="info"
          defaultIcon={
            <Iconify
              icon="ic:twotone-event-note"
              width={50}
              color={alpha(theme.palette.info.main, 0.8)}
            />
          }
          isLoading={isLoading}
          error={error}
          disableReFetchLoadingStatus={disableReFetchLoadingStatus}
          intervalToReFetch={interval}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <WidgetSummary
          widgetTemplate={reviewingEventWidget}
          defaultTitle={
            wordLibrary?.["widget-template-reviewing events"] ?? "審核中事件數"
          }
          placeholder={
            <Iconify icon="eos-icons:three-dots-loading" width={30} />
          }
          defaultColor="warning"
          defaultIcon={
            <Iconify
              icon="ic:twotone-preview"
              width={50}
              color={alpha(theme.palette.warning.main, 0.8)}
            />
          }
          isLoading={isLoading}
          error={error}
          disableReFetchLoadingStatus={disableReFetchLoadingStatus}
          intervalToReFetch={interval}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <WidgetSummary
          widgetTemplate={expiredEventWidget}
          defaultTitle={
            wordLibrary?.["widget-template-expired events"] ?? "過期事件數"
          }
          placeholder={
            <Iconify icon="eos-icons:three-dots-loading" width={30} />
          }
          defaultColor="error"
          defaultIcon={
            <Iconify
              icon="ic:twotone-event-busy"
              width={50}
              color={alpha(theme.palette.error.main, 0.8)}
            />
          }
          isLoading={isLoading}
          error={error}
          disableReFetchLoadingStatus={disableReFetchLoadingStatus}
          intervalToReFetch={interval}
        />
      </Grid>
    </Grid>
  );
}

export default WidgetSummaryAnalytics;
