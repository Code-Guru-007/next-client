import React, { FC, useMemo } from "react";
import { useRouter } from "next/router";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";

import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import Button from "@eGroupAI/material/Button";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import Divider from "@eGroupAI/material/Divider";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { DIALOG as CONFIRM_DIALOG } from "components/ConfirmDialog";
import { OrganizationEvent } from "interfaces/entities";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { format } from "@eGroupAI/utils/dateUtils";

const useStyles = makeStyles(() => ({
  editSection: {
    borderRadius: 0,
    boxShadow: "none",
    padding: "20px",
  },
  editSectionHeader: {
    marginBottom: "30px",
  },
  deleteLabe: {
    marginRight: "10px",
  },
  typography: {
    minWidth: "150px",
    display: "inline-block",
  },
}));

const serviceModuleParams = [
  {
    modulePathName: "/crm/users",
    targetName: "userId",
    eventsTabName: "CRM_USER_EVENTS",
  },
  {
    modulePathName: "/crm/partners",
    targetName: "partnerId",
    eventsTabName: "CRM_PARTNER_EVENTS",
  },
  {
    modulePathName: "/members/list",
    targetName: "memberId",
    eventsTabName: "HRM_MEMBERS_INFO_EVENTS",
  },
];

export interface UserSettingsProps {
  organizationId?: string;
  event?: OrganizationEvent;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const EventSetting: FC<UserSettingsProps> = function (props) {
  const {
    event,
    organizationId,
    readable = false,
    writable = false,
    deletable = false,
  } = props;

  const classes = useStyles();
  const router = useRouter();
  const { query } = router;

  const currentModuleInfo = useMemo(
    () =>
      serviceModuleParams.filter((param) =>
        router.route.includes(param.modulePathName)
      )[0],
    [router.route]
  );

  const matchMutate = useSwrMatchMutate();
  const wordLibrary = useSelector(getWordLibrary);

  const { excute: deleteOrgEvent, isLoading: isDeleting } = useAxiosApiWrapper(
    apis.org.deleteOrgEvent,
    "Delete"
  );

  const { excute: updateOrgEvent, isLoading: isUpdating } = useAxiosApiWrapper(
    apis.org.updateOrgEvent,
    "Update"
  );

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const { openDialog: openConfirmDialog, closeDialog: closeConfirmDialog } =
    useReduxDialog(CONFIRM_DIALOG);

  const userCreateDate =
    event &&
    format(
      zonedTimeToUtc(
        new Date(event.organizationEventCreateDate),
        "Asia/Taipei"
      ),
      "PP pp",
      {
        locale: zhCN,
      }
    );
  const userUpdateDate =
    event &&
    format(
      zonedTimeToUtc(
        new Date(event.organizationEventUpdateDate),
        "Asia/Taipei"
      ),
      "PP pp",
      {
        locale: zhCN,
      }
    );

  return (
    <>
      <EditSection className={classes.editSection}>
        <EditSectionHeader
          primary={wordLibrary?.information ?? "資訊"}
          className={classes.editSectionHeader}
        />

        {readable && (
          <>
            <Stack direction="column" marginBottom={2}>
              <ListItemText
                primary={wordLibrary?.["creation time"] ?? "建立時間"}
                secondary={userCreateDate}
                primaryTypographyProps={{
                  typography: "body2",
                  color: "text.secondary",
                  mb: 0.5,
                }}
                secondaryTypographyProps={{
                  typography: "subtitle2",
                  color: "text.primary",
                  component: "span",
                }}
              />
            </Stack>
            <Stack direction="column" marginBottom={2}>
              <ListItemText
                primary={wordLibrary?.["update time"] ?? "更新時間"}
                secondary={userUpdateDate}
                primaryTypographyProps={{
                  typography: "body2",
                  color: "text.secondary",
                  mb: 0.5,
                }}
                secondaryTypographyProps={{
                  typography: "subtitle2",
                  color: "text.primary",
                  component: "span",
                }}
              />
            </Stack>

            {event && (
              <Stack direction="column" marginBottom={2}>
                <ListItemText
                  primary="建立者"
                  secondary={event?.creator?.memberName}
                  primaryTypographyProps={{
                    typography: "body2",
                    color: "text.secondary",
                    mb: 0.5,
                  }}
                  secondaryTypographyProps={{
                    typography: "subtitle2",
                    color: "text.primary",
                    component: "span",
                  }}
                />
              </Stack>
            )}
            {event && (
              <Stack direction="column" marginBottom={2}>
                <ListItemText
                  primary="更新者"
                  secondary={event.updater?.memberName}
                  primaryTypographyProps={{
                    typography: "body2",
                    color: "text.secondary",
                    mb: 0.5,
                  }}
                  secondaryTypographyProps={{
                    typography: "subtitle2",
                    color: "text.primary",
                    component: "span",
                  }}
                />
              </Stack>
            )}
          </>
        )}
      </EditSection>
      <Divider />
      {(deletable || writable) && (
        <>
          <EditSection className={classes.editSection}>
            <EditSectionHeader
              primary={wordLibrary?.["data operations"] ?? "資料操作"}
              className={classes.editSectionHeader}
            />
            <Grid container spacing={2}>
              {writable && event?.organizationEventIsOpen === 1 && (
                <>
                  <Grid item xs={12}>
                    <Typography color="body1" className={classes.typography}>
                      {wordLibrary?.["close event"] ?? "關閉事件"}
                    </Typography>
                    <Button
                      variant="contained"
                      rounded
                      size="small"
                      color="error"
                      loading={isUpdating}
                      disabled={isUpdating}
                      onClick={() => {
                        if (event) {
                          openConfirmDeleteDialog({
                            primary: `確定關閉${event.organizationEventTitle}嗎？`,
                            onConfirm: async () => {
                              if (organizationId) {
                                try {
                                  closeConfirmDeleteDialog();
                                  await updateOrgEvent({
                                    organizationId,
                                    organizationEventId:
                                      event.organizationEventId,
                                    organizationEventIsOpen: 0,
                                  });
                                  matchMutate(
                                    new RegExp(
                                      `^/organizations/${organizationId}/events/${event.organizationEventId}`,
                                      "g"
                                    )
                                  );
                                } catch (err) {
                                  apis.tools.createLog({
                                    function: "updateOrgEvent: error",
                                    browserDescription:
                                      window.navigator.userAgent,
                                    jsonData: {
                                      data: err,
                                      deviceInfo: getDeviceInfo(),
                                    },
                                    level: "ERROR",
                                  });
                                }
                              }
                            },
                          });
                        }
                      }}
                      id="event-close-button"
                      data-tid="event-close-button"
                    >
                      {wordLibrary?.close ?? "關閉"}
                    </Button>
                  </Grid>
                </>
              )}
              {writable && event?.organizationEventIsOpen === 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography color="body1" className={classes.typography}>
                      {wordLibrary?.["open event"] ?? "開啟事件"}
                    </Typography>
                    <Button
                      variant="contained"
                      rounded
                      size="small"
                      color="success"
                      loading={isUpdating}
                      disabled={isUpdating}
                      onClick={() => {
                        if (event) {
                          openConfirmDialog({
                            primary: `確定開啟${event.organizationEventTitle}嗎？`,
                            onConfirm: async () => {
                              if (organizationId) {
                                try {
                                  closeConfirmDialog();
                                  await updateOrgEvent({
                                    organizationId,
                                    organizationEventId:
                                      event.organizationEventId,
                                    organizationEventIsOpen: 1,
                                  });
                                  matchMutate(
                                    new RegExp(
                                      `^/organizations/${organizationId}/events/${event.organizationEventId}`,
                                      "g"
                                    )
                                  );
                                } catch (err) {
                                  apis.tools.createLog({
                                    function: "updateOrgEvent: error",
                                    browserDescription:
                                      window.navigator.userAgent,
                                    jsonData: {
                                      data: err,
                                      deviceInfo: getDeviceInfo(),
                                    },
                                    level: "ERROR",
                                  });
                                }
                              }
                            },
                          });
                        }
                      }}
                      id="open-event-button"
                      data-tid="open-event-button"
                    >
                      開啟
                    </Button>
                  </Grid>
                </>
              )}
              {deletable && (
                <>
                  <Grid item xs={12}>
                    <Typography color="body1" className={classes.typography}>
                      {wordLibrary?.delete ?? "刪除"}
                    </Typography>
                    <Button
                      id="delete-event-button"
                      data-tid="delete-event-button"
                      variant="contained"
                      rounded
                      size="small"
                      color="error"
                      loading={isDeleting}
                      onClick={() => {
                        if (event) {
                          openConfirmDeleteDialog({
                            primary: `確定刪除${event.organizationEventTitle}嗎？`,
                            deletableName: event.organizationEventTitle,
                            onConfirm: async () => {
                              if (organizationId) {
                                try {
                                  closeConfirmDeleteDialog();
                                  await deleteOrgEvent({
                                    organizationId,
                                    organizationEventId:
                                      event.organizationEventId,
                                  });
                                  if (
                                    query[
                                      currentModuleInfo?.targetName || "userId"
                                    ]
                                  ) {
                                    router.replace(
                                      `/me/${
                                        currentModuleInfo?.modulePathName ||
                                        "crm/users"
                                      }/${
                                        query[
                                          currentModuleInfo?.targetName ||
                                            "userId"
                                        ]
                                      }?tab=${
                                        currentModuleInfo?.eventsTabName ||
                                        "CRM_USER_EVENTS"
                                      }`
                                    );
                                  } else {
                                    router.replace("/me/event/events");
                                  }
                                } catch (error) {
                                  apis.tools.createLog({
                                    function:
                                      "DatePicker: openConfirmDeleteDialog",
                                    browserDescription:
                                      window.navigator.userAgent,
                                    jsonData: {
                                      data: error,
                                      deviceInfo: getDeviceInfo(),
                                    },
                                    level: "ERROR",
                                  });
                                }
                              }
                            },
                          });
                        }
                      }}
                    >
                      {wordLibrary?.delete ?? "刪除"}
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </EditSection>
        </>
      )}
    </>
  );
};

export default EventSetting;
