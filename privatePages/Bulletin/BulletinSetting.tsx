import React, { FC } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import Divider from "@eGroupAI/material/Divider";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";

import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import Button from "@eGroupAI/material/Button";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { format } from "@eGroupAI/utils/dateUtils";
import Center from "@eGroupAI/material-layout/Center";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { Bulletin } from "interfaces/entities";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";

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

export interface BulletinSettingProps {
  bulletin?: Bulletin;
  organizationId: string;
  orgUser;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const BulletinSetting: FC<BulletinSettingProps> = (props) => {
  const {
    bulletin,
    organizationId,
    orgUser,
    readable = false,
    deletable = false,
  } = props;
  const classes = useStyles();
  const router = useRouter();
  const wordLibrary = useSelector(getWordLibrary);
  const { excute: deleteBulletin, isLoading: isDeleting } = useAxiosApiWrapper(
    apis.org.deleteBulletin,
    "Delete"
  );
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
    setDialogStates: setConfirmDeleteDialogStates,
  } = useReduxDialog(DELETE_DIALOG);

  const bulletinCreateDate =
    bulletin && format(bulletin.bulletinCreateDate, "PP pp");
  const bulletinUpdateDate =
    bulletin && format(bulletin.bulletinUpdateDate, "PP pp");

  return (
    <>
      {!readable && (
        <Center offsetTop={200}>
          <Typography variant="h5">
            {wordLibrary?.["no such permission"] ?? "無此權限"}
          </Typography>
        </Center>
      )}
      {readable && (
        <>
          <EditSection className={classes.editSection}>
            <EditSectionHeader
              primary={wordLibrary?.information ?? "資訊"}
              className={classes.editSectionHeader}
            />

            <Stack direction="column" marginBottom={2}>
              <ListItemText
                primary={wordLibrary?.["creation time"] ?? "建立時間"}
                secondary={bulletinCreateDate}
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
                primary="更新時間"
                secondary={bulletinUpdateDate}
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
          </EditSection>
          <Divider />
          {deletable && (
            <EditSection className={classes.editSection}>
              <EditSectionHeader
                primary={wordLibrary?.["data operations"] ?? "資料操作"}
                className={classes.editSectionHeader}
              />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography color="body1" className={classes.typography}>
                    {wordLibrary?.["data deletion"] ?? "資料刪除"}
                  </Typography>
                  <Button
                    id="bulletin-delete-btn"
                    data-tid="bulletin-delete-btn"
                    variant="contained"
                    rounded
                    size="small"
                    color="error"
                    loading={isDeleting}
                    onClick={() => {
                      if (bulletin) {
                        openConfirmDeleteDialog({
                          primary:
                            wordLibrary?.[
                              "Please enter the title to delete Bulletin"
                            ] ??
                            `確定要刪除佈告欄 '${bulletin.bulletinTitle}' 嗎？`,
                          deletableName: bulletin.bulletinTitle,
                          isDeleting,
                          onConfirm: async () => {
                            if (organizationId) {
                              try {
                                setConfirmDeleteDialogStates({
                                  isDeleting: true,
                                });
                                await deleteBulletin({
                                  organizationId,
                                  bulletinId: bulletin.bulletinId,
                                });
                                closeConfirmDeleteDialog();
                                router.replace("/me/bulletins");
                              } catch (error) {
                                apis.tools.createLog({
                                  function: "deleteBulletin: error",
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
              </Grid>
            </EditSection>
          )}
        </>
      )}
    </>
  );
};

export default BulletinSetting;
