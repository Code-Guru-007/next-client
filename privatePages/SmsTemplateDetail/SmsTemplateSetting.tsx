import React, { FC } from "react";
import { useRouter } from "next/router";
import Divider from "@eGroupAI/material/Divider";
import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

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
import { OrganizationSmsTemplate } from "interfaces/entities";
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

export interface SmsTemplateSettingProps {
  smsTemplate?: OrganizationSmsTemplate;
  organizationId: string;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const SmsTemplateSetting: FC<SmsTemplateSettingProps> = (props) => {
  const {
    smsTemplate,
    organizationId,
    readable = false,
    deletable = false,
  } = props;
  const classes = useStyles();
  const router = useRouter();
  const wordLibrary = useSelector(getWordLibrary);
  const { excute: deleteSmsTemplate, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.org.deleteSmsTemplate, "Delete");
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const smsTemplateCreateDate =
    smsTemplate &&
    format(smsTemplate.organizationSmsTemplateCreateDate, "PP pp");
  const smsTemplateUpdateDate =
    smsTemplate &&
    format(smsTemplate.organizationSmsTemplateUpdateDate, "PP pp");

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
                secondary={smsTemplateCreateDate}
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
                secondary={smsTemplateUpdateDate}
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
                primary="建立者"
                secondary={smsTemplate?.creator?.memberName}
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
            {smsTemplate?.updater?.memberName && (
              <Stack direction="column" marginBottom={2}>
                <ListItemText
                  primary="更新者"
                  secondary={smsTemplate?.updater?.memberName}
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
                    id="delete-button"
                    variant="contained"
                    rounded
                    size="small"
                    color="error"
                    loading={isDeleting}
                    onClick={() => {
                      if (smsTemplate) {
                        openConfirmDeleteDialog({
                          primary: `確定刪除${smsTemplate.organizationSmsTemplateTitle}嗎？`,
                          onConfirm: async () => {
                            if (organizationId) {
                              try {
                                await deleteSmsTemplate({
                                  organizationId,
                                  organizationSmsTemplateId:
                                    smsTemplate.organizationSmsTemplateId,
                                });
                                closeConfirmDeleteDialog();
                                router.replace("/me/sms-template");
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
              </Grid>
            </EditSection>
          )}
        </>
      )}
    </>
  );
};

export default SmsTemplateSetting;
