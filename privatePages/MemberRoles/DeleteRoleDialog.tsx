import React, { FC } from "react";

import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { EntityList, OrganizationRole } from "@eGroupAI/typings/apis";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { AxiosResponse } from "axios";
import { KeyedMutator } from "swr";
import MembersMiniTable from "./MembersMiniTable";

export const DIALOG = "DeleteRoleDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));
interface OrgRoleDialogProps {
  organizationRole?: OrganizationRole;
  organizationId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutate: KeyedMutator<AxiosResponse<EntityList<OrganizationRole>, any>>;
}

const DeleteRoleDialog: FC<OrgRoleDialogProps> = function (props) {
  const { organizationRole, organizationId, mutate } = props;
  const theme = useTheme();
  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { excute: deleteOrgRole, isLoading: isDeleting } = useAxiosApiWrapper(
    apis.org.deleteOrgRole,
    "Delete"
  );

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="lg"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        您確定要刪除{organizationRole?.organizationRoleNameZh}角色嗎?
        以下是該角色的相關成員：
      </DialogTitle>
      <DialogContent>
        <MembersMiniTable organizationRole={organizationRole} />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton 
          id="delete-role-dialog-close-button"
          data-tid="delete-role-dialog-close-button"
          onClick={closeDialog} />
        <DialogConfirmButton
          id="delete-role-dialog-confirm-button"
          data-tid="delete-role-dialog-confirm-button"
          sx={{ ml: 1, backgroundColor: "rgb(233, 80, 80) !important" }}
          onClick={async () => {
            try {
              if (organizationId && organizationRole) {
                await deleteOrgRole({
                  organizationId,
                  organizationRoleId: organizationRole.organizationRoleId,
                });
                mutate();
                closeDialog();
              }
            } catch (error) {
              apis.tools.createLog({
                function: "deleteOrgRole: error",
                browserDescription: window.navigator.userAgent,
                jsonData: {
                  data: error,
                  deviceInfo: getDeviceInfo(),
                },
                level: "ERROR",
              });
            }
          }}
          loading={isDeleting}
          disabled={isDeleting}
        >
          {wordLibrary?.delete ?? "刪除"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRoleDialog;
