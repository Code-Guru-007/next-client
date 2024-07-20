import React, { useState, useEffect, useMemo } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import clsx from "clsx";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useRouter } from "next/router";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { makeStyles } from "@mui/styles";
import { TimelineDotProps } from "@mui/lab/TimelineDot";

import Container from "@eGroupAI/material/Container";
import CircularProgress from "@eGroupAI/material/CircularProgress";
import Main from "@eGroupAI/material-layout/Main";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useUserPermission from "@eGroupAI/hooks/apis/useUserPermission";
import useTab from "@eGroupAI/hooks/useTab";

import Label from "minimal/components/label";

import PrivateLayout from "components/PrivateLayout";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import ResponsiveTabs from "components/ResponsiveTabs";

import useBreadcrumb from "utils/useBreadcrumb";
import useOrgEvent from "utils/useOrgEvent";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { useSettingsContext } from "minimal/components/settings";
import { OrganizationReviewStatusTypeMap } from "interfaces/utils";

import EventInfoHistoryDialog, {
  DIALOG as HISTORY_DIALOG,
  RecordTarget,
} from "./EventInfoHistoryDialog";

import EventInfo from "./EventInfo";
import EventOrganizationPartner from "./EventOrganizationPartner";
import EventReviewTable from "./EventReviewTable";
import EventUserTable from "./EventUserTable";
import EventMemberTable from "./EventMemberTable";
import EventUploadFiles from "./EventUploadFiles";
import EventCommentList from "./EventCommentList";
import EventPermissionMange from "./EventPermissionManage";
import EventSetting from "./EventSetting";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: "16px",
    position: "relative",
  },
  mainLayout: {
    background: "#F5F6FA",
    paddingTop: 0,
  },
  tabContainer: {
    borderRadius: 0,
    boxShadow: "none",
    padding: 0,
    marginBottom: 0,
    "& .MuiTabs-indicator": {
      height: 2,
    },
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
  successStatus: {
    backgroundColor: `${theme.palette.success.main}`,
  },
  warningStatus: {
    backgroundColor: `${theme.palette.warning.main}`,
  },
  greyStatus: {
    backgroundColor: `${theme.palette.text.primary}`,
  },
  tag: {
    color: "white",
    border: "1px solid transparent",
    padding: "4px 10px",
    borderRadius: "15px",
    width: "fit-content",
    display: "flex",
    justifyContent: "center",
    fontSize: "0.9375rem",
    marginLeft: "10px",
  },
  processingStatus: {
    backgroundColor: `#2196f3 !important`,
  },
}));

const Event = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const { query, push, pathname } = useRouter();
  const classes = useStyles();
  const theme = useTheme();
  const isDownmd = useMediaQuery(theme.breakpoints.down("md"));
  const settings = useSettingsContext();
  const [recordTarget, setRecordTarget] = useState<RecordTarget>({});
  const { openDialog: openHistoryDialog } = useReduxDialog(HISTORY_DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { excute: updateOrgEvent, isLoading } = useAxiosApiWrapper(
    apis.org.updateOrgEvent,
    "Update"
  );

  const StatusTextMap = {
    success: wordLibrary?.["in progress"] ?? "進行中",
    warning: wordLibrary?.expired ?? "已過期",
    grey: wordLibrary?.closed ?? "已關閉",
  };

  const {
    data,
    mutate,
    isValidating: isLoadingEvent,
    error,
  } = useOrgEvent(
    {
      organizationId,
      organizationEventId: query.eventId as string,
    },
    {
      locale,
    }
  );

  const { value, setValue } = useTab<string>(
    "Event",
    (query.tab as string) || "none",
    true
  );

  const { data: permissions, isValidating } = useUserPermission({
    organizationId,
    serviceModuleValue: "EVENT",
    targetId: query.eventId as string,
  });

  const isEventOpened = data?.organizationEventIsOpen;
  const endDate = new Date(data?.organizationEventEndDate || "");
  let status: TimelineDotProps["color"] = "success";
  if (isEventOpened && endDate < new Date()) {
    status = "warning";
  } else if (!isEventOpened) {
    status = "grey";
  }
  const getReviewColor = (reviewStatusType) => {
    switch (reviewStatusType) {
      case "SUCCESS":
        return "success";
      case "REJECT":
        return "error";
      default:
        return "default";
    }
  };
  const subNavbarText = (
    <>
      <Label
        variant="soft"
        color={
          (status === "success" && "success") ||
          (status === "warning" && "warning") ||
          "default"
        }
        sx={{ padding: "15px", margin: "10px" }}
      >
        {StatusTextMap[status]}
      </Label>
      {data?.isReviewing ? (
        <Label
          variant="filled"
          color="info"
          sx={{
            padding: "15px 25px",
            margin: "10px",
            marginLeft: "0px",
          }}
        >
          {OrganizationReviewStatusTypeMap.PROCESSING}
        </Label>
      ) : (
        data?.organizationReview &&
        Object.keys(data.organizationReview).length !== 0 && (
          <Label
            variant="filled"
            color={getReviewColor(
              data.organizationReview.organizationReviewStatusType
            )}
            sx={{
              padding: "15px 25px",
              margin: "10px",
              marginLeft: "0px",
            }}
          >
            {
              OrganizationReviewStatusTypeMap[
                data.organizationReview.organizationReviewStatusType
              ]
            }
          </Label>
        )
      )}
    </>
  );

  useBreadcrumb(data?.organizationEventTitle || "");

  useEffect(() => {
    if (error?.response?.status === 404) {
      push({
        pathname: pathname.split("[")[0],
      });
    }
  }, [error, pathname, push]);

  useEffect(() => {
    if (query.tab) {
      setValue(query.tab as string);
    }
  }, [query.tab, setValue]);

  const permissionTabs = useMemo(
    () => permissions?.filter((per) => per.permissionMap.READ),
    [permissions]
  );

  useEffect(() => {
    if (permissionTabs && value === "none") {
      const tabName = permissionTabs[0]?.serviceSubModuleValue;
      push({
        pathname,
        query: {
          ...query,
          tab: query.tab || tabName,
        },
      });
    }
  }, [permissionTabs, pathname, push, query, setValue, value]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateEvent = async (values: { [key: string]: any }) => {
    if (query.eventId) {
      try {
        await updateOrgEvent({
          organizationId,
          organizationEventId: query.eventId as string,
          ...values,
        });
        mutate();
      } catch (error) {
        apis.tools.createLog({
          function: "DatePicker: handleUpdateEvent",
          browserDescription: window.navigator.userAgent,
          jsonData: {
            data: error,
            deviceInfo: getDeviceInfo(),
          },
          level: "ERROR",
        });
      }
    }
  };

  const getPermissionSubModule = (value, permission) => {
    if (!permissionTabs) return false;
    return !!permissionTabs.filter((p) => p.serviceSubModuleValue === value)[0]
      ?.permissionMap?.[permission];
  };

  const tabData = useMemo(
    () =>
      permissionTabs?.map((e, index) => ({
        value: e.serviceSubModuleValue,
        label:
          locale === "zh_TW"
            ? e?.serviceSubModuleNameZh || ""
            : e?.serviceSubModuleNameEn || "",
        id: `event-tab-${e?.serviceSubModuleValue
          ?.split("_")[1]
          ?.toLowerCase()}`,
        testId: `event-tab-${index}`,
      })),
    [permissionTabs, locale]
  );

  const handleClickHistory = (r?: RecordTarget) => {
    if (r) {
      setRecordTarget(r);
      openHistoryDialog();
    }
  };

  const translatedTitle = `${data?.organizationEventTitle || ""} | ${
    wordLibrary?.["事件管理"] ?? "事件管理"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;

  return (
    <PrivateLayout
      title={translatedTitle}
      responsiveBreadcrumbs
      subNavbarText={subNavbarText}
      isLoading={isLoadingEvent}
      paddingGutter={isDownmd ? 35 : 0}
    >
      <Main>
        <Container maxWidth={false} className={classes.container}>
          <div
            className={clsx(
              classes.loader,
              isValidating && classes.showLoader,
              {
                [classes.lightOpacity]: settings.themeMode === "light",
                [classes.darkOpacity]: settings.themeMode !== "light",
              }
            )}
          >
            <CircularProgress />
          </div>
          <ResponsiveTabs
            value={value}
            tabData={tabData}
            onChange={(value) => {
              push({
                pathname,
                query: {
                  ...query,
                  tab: value,
                },
              });
            }}
          />
          {data && (
            <>
              {value === "EVENT_INFO" &&
                getPermissionSubModule(value, "READ") && (
                  <EventInfo
                    data={data}
                    onShowHistoryDialog={handleClickHistory}
                    onUpdateEvent={handleUpdateEvent}
                    isMutating={isLoadingEvent}
                    loading={isLoading}
                    readable
                    writable={getPermissionSubModule(value, "WRITE")}
                    deletable={getPermissionSubModule(value, "DELETE")}
                  />
                )}
              {value === "CRM_USERS" &&
                getPermissionSubModule(value, "READ") && (
                  <EventUserTable
                    data={data}
                    onUpdateEvent={handleUpdateEvent}
                    loading={isLoading || isLoadingEvent}
                    writable={getPermissionSubModule(value, "WRITE")}
                    deletable={getPermissionSubModule(value, "DELETE")}
                  />
                )}
              {value === "MEMBERS" && getPermissionSubModule(value, "READ") && (
                <EventMemberTable
                  data={data}
                  onUpdateEvent={handleUpdateEvent}
                  loading={isLoading || isLoadingEvent}
                  writable={getPermissionSubModule(value, "WRITE")}
                  deletable={getPermissionSubModule(value, "DELETE")}
                />
              )}
              {value === "CRM_ORGANIZATION" &&
                getPermissionSubModule(value, "READ") && (
                  <EventOrganizationPartner
                    event={data}
                    isLoadingEvent={isLoadingEvent}
                    readable
                    writable={getPermissionSubModule(value, "WRITE")}
                    deletable={getPermissionSubModule(value, "DELETE")}
                    onUpdateEvent={handleUpdateEvent}
                  />
                )}
              {value === "EVENT_FILES" &&
                getPermissionSubModule(value, "READ") && (
                  <EventUploadFiles
                    event={data}
                    onUpdateEvent={handleUpdateEvent}
                    readable
                    writable={getPermissionSubModule(value, "WRITE")}
                    deletable={getPermissionSubModule(value, "DELETE")}
                    onMergeSuccess={() => mutate()}
                    mutate={mutate}
                  />
                )}
              {value === "EVENT_COMMENT" &&
                getPermissionSubModule(value, "READ") && (
                  <EventCommentList
                    event={data}
                    isLoadingEvent={isLoadingEvent}
                    readable
                    writable={getPermissionSubModule(value, "WRITE")}
                    deletable={getPermissionSubModule(value, "DELETE")}
                  />
                )}
              {value === "EVENT_REVIEW" &&
                getPermissionSubModule(value, "READ") && (
                  <EventReviewTable
                    event={data}
                    editable={getPermissionSubModule(value, "WRITE")}
                  />
                )}
              {value === "EVENT_AUTH" &&
                getPermissionSubModule(value, "READ") && (
                  <EventPermissionMange
                    targetId={data?.organizationEventId}
                    readable
                    writable={getPermissionSubModule(value, "WRITE")}
                    deletable={getPermissionSubModule(value, "DELETE")}
                  />
                )}
              {value === "EVENT_SETTINGS" &&
                getPermissionSubModule(value, "READ") && (
                  <EventSetting
                    organizationId={organizationId}
                    event={data}
                    readable
                    writable={getPermissionSubModule(value, "WRITE")}
                    deletable={getPermissionSubModule(value, "DELETE")}
                  />
                )}
            </>
          )}
        </Container>
        <EventInfoHistoryDialog
          targetId={query.eventId as string}
          recordTarget={recordTarget}
        />
      </Main>
    </PrivateLayout>
  );
};

export default Event;
