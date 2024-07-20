import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import { WidgetTemplate } from "interfaces/entities";
import useWidgetTemplateDetail from "utils/useWidgetTemplate";

import { ColorSchema } from "minimal/theme/palette";
import AnalyticsWidgetSummary from "minimal/sections/overview/analytics/analytics-widget-summary";
import { AxiosError } from "axios";

export interface WidgetSummaryProps {
  defaultTitle: string;
  placeholder?: React.ReactNode;
  defaultIcon: React.ReactNode;
  defaultColor?: ColorSchema;
  widgetTemplate?: WidgetTemplate;
  intervalToReFetch?: number;
  isLoading?: boolean;
  error?: AxiosError<unknown, any>;
  disableReFetchLoadingStatus?: boolean;
}

function WidgetSummary(props: WidgetSummaryProps) {
  const {
    widgetTemplate,
    defaultTitle,
    placeholder,
    defaultIcon,
    defaultColor,
    isLoading = false,
    error,
    disableReFetchLoadingStatus = false,
    intervalToReFetch = 30000, // Default to 30 seconds
  } = props;

  const organizationId = useSelector(getSelectedOrgId);
  const [shouldLoadingStatus, setShouldLoadingStatus] = useState<boolean>(true);

  const {
    data: widgetDetail,
    mutate,
    isValidating,
    error: refetchError,
  } = useWidgetTemplateDetail({
    organizationId,
    widgetTemplateId: widgetTemplate?.widgetTemplateId || "",
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (disableReFetchLoadingStatus) setShouldLoadingStatus(false);
      else setShouldLoadingStatus(true);
      mutate();
    }, intervalToReFetch);
    return () => clearInterval(intervalId);
  }, [intervalToReFetch, mutate, disableReFetchLoadingStatus]);

  return (
    <AnalyticsWidgetSummary
      title={defaultTitle}
      total={widgetDetail?.reportDataList?.[0]?.["1"]}
      tatalPlaceholder={placeholder}
      color={defaultColor}
      icon={defaultIcon}
      isFetching={isValidating || isLoading}
      error={error || refetchError}
      showLoadingStatus={shouldLoadingStatus}
    />
  );
}

export default WidgetSummary;
