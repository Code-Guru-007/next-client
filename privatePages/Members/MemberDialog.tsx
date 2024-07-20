import React, { FC } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import apis from "utils/apis";
import useStaticColumns from "utils/useStaticColumns";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import useReduxDialog from "@eGroupAI/redux-modules/dialogs/useReduxDialog";
import { OrganizationMember } from "@eGroupAI/typings/apis";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useCheckOrgOwner from "@eGroupAI/hooks/apis/useCheckOrgOwner";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";

import Typography from "@eGroupAI/material/Typography";
import Box from "@eGroupAI/material/Box";
import Button from "@eGroupAI/material/Button";
import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import { Table } from "interfaces/utils";

export const DIALOG = "MemberDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

interface MemberDialogProps {
  orgMember?: OrganizationMember;
}

const MemberDialog: FC<MemberDialogProps> = function (props) {
  const { orgMember } = props;
  const theme = useTheme();
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const matchMutate = useSwrMatchMutate();
  const { isOrgOwner, loginId } = useCheckOrgOwner();
  const { excute: deleteOrgMember } = useAxiosApiWrapper(
    apis.org.deleteOrgMember,
    "Delete"
  );
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);
  const columns = useStaticColumns(Table.MEMBERS, "isEdit");

  const renderContent = () => {
    if (!columns || !orgMember) return undefined;
    return columns.map((el) => {
      const val = el.sortKey && orgMember.member[el.sortKey];
      return (
        <Typography variant="body1" gutterBottom key={el.id}>
          {wordLibrary?.[el.columnName] ?? el.columnName}:{" "}
          {el.format ? el.format(val) : val}
        </Typography>
      );
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>成員資料</DialogTitle>
      <DialogContent>{renderContent()}</DialogContent>
      <DialogActions>
        {isOrgOwner && loginId !== orgMember?.member.loginId && (
          <Button
            id="member-delete-button"
            data-tid="member-delete-button" 
            color="error"
            variant="contained"
            onClick={() => {
              if (!orgMember) return;
              openConfirmDeleteDialog({
                primary: `確定刪除${orgMember.member.memberName}嗎？`,
                onConfirm: async () => {
                  if (organizationId) {
                    try {
                      deleteOrgMember({
                        organizationId,
                        loginId: orgMember.member.loginId,
                      });
                      matchMutate(
                        new RegExp(
                          `^/organizations/${organizationId}/search/members\\?`,
                          "g"
                        )
                      );
                      closeDialog();
                      closeConfirmDeleteDialog();
                    } catch (error) {
                      apis.tools.createLog({
                        function: "deleteOrgMember: error",
                        browserDescription: window.navigator.userAgent,
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
            }}
          >
            {wordLibrary?.delete ?? "刪除"}
          </Button>
        )}
        <Box flexGrow={1} />
        <DialogCloseButton 
          id="member-dialog-close-button"
          data-tid="member-dialog-close-button"
          onClick={closeDialog} 
        />
      </DialogActions>
    </Dialog>
  );
};

export default MemberDialog;
