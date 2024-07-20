import React, { FC } from "react";
import { useRouter } from "next/router";

import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { useSelector } from "react-redux";
import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import Button from "@eGroupAI/material/Button";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import Divider from "@eGroupAI/material/Divider";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { OrganizationMember } from "@eGroupAI/typings/apis";
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

export interface MemberSettingsProps {
  organizationId?: string;
  orgMember?: OrganizationMember;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const MemberSettings: FC<MemberSettingsProps> = function (props) {
  const {
    orgMember,
    organizationId,
    readable = false,
    writable = false,
    deletable = false,
  } = props;

  const classes = useStyles();
  const router = useRouter();
  const wordLibrary = useSelector(getWordLibrary);

  const { excute: deleteOrgMember, isLoading: isDeleting } = useAxiosApiWrapper(
    apis.member.deleteOrgMember,
    "Delete"
  );

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
    setDialogStates: setConfirmDeleteDialogStates,
  } = useReduxDialog(DELETE_DIALOG);

  const memberCreateDate =
    orgMember && format(orgMember.organizationMemberCreateDate, "PP pp");
  const memberUpdateDate =
    orgMember && format(orgMember.organizationMemberUpdateDate, "PP pp");

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
                secondary={memberCreateDate}
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
                secondary={memberUpdateDate}
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
            {orgMember && (
              <Stack direction="column" marginBottom={2}>
                <ListItemText
                  primary="建立者"
                  secondary={orgMember?.member.memberName}
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
            {orgMember && (
              <Stack direction="column" marginBottom={2}>
                <ListItemText
                  primary="更新者"
                  secondary={orgMember?.member.memberName}
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
              {deletable && (
                <>
                  <Grid item xs={12}>
                    <Typography color="body1" className={classes.typography}>
                      {wordLibrary?.["data deletion"] ?? "資料刪除"}
                    </Typography>
                    <Button
                      id="member-table-delete-btn"
                      data-tid="member-table-delete-btn"
                      variant="contained"
                      rounded
                      size="small"
                      color="error"
                      loading={isDeleting}
                      onClick={() => {
                        if (orgMember) {
                          openConfirmDeleteDialog({
                            primary: `確定刪除${orgMember.member.memberName}嗎？`,
                            deletableName: orgMember.member.memberName,
                            onConfirm: async () => {
                              if (organizationId) {
                                try {
                                  setConfirmDeleteDialogStates({
                                    isDeleting: true,
                                  });
                                  await deleteOrgMember({
                                    organizationId,
                                    loginId: orgMember?.member.loginId,
                                  });
                                  closeConfirmDeleteDialog();
                                  router.replace("/me/members/list");
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

export default MemberSettings;
