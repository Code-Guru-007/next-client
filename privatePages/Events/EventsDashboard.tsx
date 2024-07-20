import React, { useMemo } from "react";
import Container from "@mui/material/Container";
import PrivateLayout from "components/PrivateLayout";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { useSettingsContext } from "minimal/components/settings";
import WidgetSummaryAnalytics from "components/WidgetSummaryAnalytics";
import useWidgetTemplateList from "utils/useWidgetTemplateList";
import { ServiceModuleValue } from "interfaces/utils";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

// ----------------------------------------------------------------------

export default function EventsDashboard() {
  const settings = useSettingsContext();

  const organizationId = useSelector(getSelectedOrgId);
  const {
    data: widgetTemplatesApiResponse,
    isValidating,
    error,
  } = useWidgetTemplateList(
    {
      organizationId,
    },
    undefined,
    {
      serviceModuleValue: ServiceModuleValue.EVENT,
    }
  );

  const widgetTemplateList = useMemo(
    () => widgetTemplatesApiResponse || [],
    [widgetTemplatesApiResponse]
  );

  const wordLibrary = useSelector(getWordLibrary);
  const translatedTitle = `${wordLibrary?.Event ?? "Event"} | ${
    wordLibrary?.Dashboard ?? "Dashboard"
  } | ${
    wordLibrary && wordLibrary["infoCenter platform"]
      ? wordLibrary["infoCenter platform"]
      : "InfoCenter 智能中台"
  }`;

  return (
    <PrivateLayout title={translatedTitle} paddingGutter={60}>
      <Container maxWidth={settings.themeStretch ? false : "xl"}>
        <WidgetSummaryAnalytics
          widgetTemplateList={widgetTemplateList}
          serviceModuleValue={ServiceModuleValue.EVENT}
          isLoading={isValidating}
          error={error}
          // disableReFetchLoadingStatus
          // interval={15000}
        />
      </Container>
    </PrivateLayout>
  );
}
