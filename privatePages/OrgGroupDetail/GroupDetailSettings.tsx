import React, { FC } from "react";
import { useRouter } from "next/router";

import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import Button from "@eGroupAI/material/Button";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import Divider from "@eGroupAI/material/Divider";

import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import { OrganizationGroup } from "interfaces/entities";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { format } from "@eGroupAI/utils/dateUtils";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

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

export interface GroupDetailSettingsProps {
  organizationId?: string;
  orgGroup?: OrganizationGroup;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const GroupDetailSettings: FC<GroupDetailSettingsProps> = function (props) {
  const {
    orgGroup,
    organizationId,
    readable = false,
    writable = false,
    deletable = false,
  } = props;

  const classes = useStyles();
  const router = useRouter();

  const { excute: deleteOrgGroup, isLoading: isDeleting } = useAxiosApiWrapper(
    apis.org.deleteOrgGroup,
    "Delete"
  );

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const wordLibrary = useSelector(getWordLibrary);

  const groupCreateDate =
    orgGroup && format(orgGroup.organizationGroupCreateDate, "PP pp");
  const groupUpdateDate =
    orgGroup && format(orgGroup.organizationGroupUpdateDate, "PP pp");

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
                secondary={groupCreateDate}
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
                secondary={groupUpdateDate}
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
          </>
        )}
      </EditSection>
      <Divider />
      {(deletable || writable) && (
        <>
          <EditSection className={classes.editSection}>
            <EditSectionHeader
              primary=""
              className={classes.editSectionHeader}
            />
            <Grid container spacing={2}>
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
                        if (orgGroup) {
                          openConfirmDeleteDialog({
                            primary: `確定刪除${orgGroup.organizationGroupName}嗎？`,
                            deletableName: orgGroup.organizationGroupName,
                            onConfirm: async () => {
                              if (organizationId) {
                                try {
                                  closeConfirmDeleteDialog();
                                  await deleteOrgGroup({
                                    organizationId,
                                    organizationGroupId:
                                      orgGroup.organizationGroupId,
                                  });
                                  router.replace("/me/org-group");
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

export default GroupDetailSettings;
