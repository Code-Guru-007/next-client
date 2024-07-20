import React, { FC } from "react";
import { useRouter } from "next/router";
import FileSaver from "file-saver";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useSelector } from "react-redux";
import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";

import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import Button from "@eGroupAI/material/Button";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import getDispositionFileName from "@eGroupAI/utils/getDispositionFileName";
import Divider from "@eGroupAI/material/Divider";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { DIALOG as CONFIRM_DIALOG } from "components/ConfirmDialog";
import { OrganizationUser } from "interfaces/entities";
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

export interface UserSettingsProps {
  organizationId?: string;
  orgUser?: OrganizationUser;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const UserSettings: FC<UserSettingsProps> = function (props) {
  const {
    orgUser,
    organizationId,
    readable = false,
    writable = false,
    deletable = false,
  } = props;

  const classes = useStyles();
  const router = useRouter();
  const wordLibrary = useSelector(getWordLibrary);

  const { excute: deleteOrgUser, isLoading: isDeleting } = useAxiosApiWrapper(
    apis.org.deleteOrgUser,
    "Delete"
  );

  const { excute: exportOrgUserPdf, isLoading: isPdfCreating } =
    useAxiosApiWrapper(apis.org.exportOrgUserPdf, "Create");

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const { openDialog: openConfirmDialog, closeDialog: closeConfirmDialog } =
    useReduxDialog(CONFIRM_DIALOG);

  const userCreateDate =
    orgUser && format(orgUser.organizationUserCreateDate, "PP pp");
  const userUpdateDate =
    orgUser && format(orgUser.organizationUserUpdateDate, "PP pp");

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
            {orgUser && (
              <Stack direction="column" marginBottom={2}>
                <ListItemText
                  primary="建立者"
                  secondary={orgUser?.creator?.memberName}
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
            {orgUser && (
              <Stack direction="column" marginBottom={2}>
                <ListItemText
                  primary="更新者"
                  secondary={orgUser?.updater?.memberName}
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
              {writable && (
                <>
                  <Grid item xs={12}>
                    <Typography color="body1" className={classes.typography}>
                      {wordLibrary?.["data export"] ?? "資料匯出"}
                    </Typography>
                    <Button
                      variant="contained"
                      rounded
                      size="small"
                      color="info"
                      loading={isPdfCreating}
                      onClick={() => {
                        openConfirmDialog({
                          primary: wordLibrary?.["data export"] ?? "資料匯出",
                          onConfirm: async () => {
                            if (orgUser) {
                              if (organizationId) {
                                try {
                                  closeConfirmDialog();
                                  const res = await exportOrgUserPdf({
                                    organizationId,
                                    organizationUserId:
                                      orgUser.organizationUserId,
                                  });

                                  const filename = getDispositionFileName(
                                    res.headers["content-disposition"] as string
                                  );
                                  FileSaver.saveAs(res.data, filename);
                                } catch (error) {
                                  apis.tools.createLog({
                                    function: "exportOrgUserPdf: error",
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
                            }
                          },
                        });
                      }}
                      id="data-export-button"
                      data-tid="data-export-button"
                    >
                      {wordLibrary?.export ?? "匯出"}
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
                      variant="contained"
                      rounded
                      size="small"
                      color="error"
                      loading={isDeleting}
                      onClick={() => {
                        if (orgUser) {
                          openConfirmDeleteDialog({
                            primary: `確定刪除${orgUser.organizationUserNameZh}嗎？`,
                            deletableName: orgUser.organizationUserNameZh,
                            onConfirm: async () => {
                              if (organizationId) {
                                try {
                                  closeConfirmDeleteDialog();
                                  await deleteOrgUser({
                                    organizationId,
                                    organizationUserId:
                                      orgUser.organizationUserId,
                                  });
                                  router.replace("/me/crm/users");
                                } catch (error) {
                                  apis.tools.createLog({
                                    function: "deleteOrgUser: error",
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
                      id="data-delete-button"
                      data-tid="data-delete-button"
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

export default UserSettings;
